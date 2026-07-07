'use server';

import {
  getHuecosDisponibles,
  getNegocioPorSlug,
  getServiciosPublicos,
} from '@/lib/db/reservas-publicas';
import { emailConfirmacionReserva } from '@/lib/email/resend';
import { appUrl, hasStripe, hasSupabaseAdmin } from '@/lib/env';
import { programarRecordatorioCita } from '@/lib/notificaciones/programar';
import { calcularDeposito } from '@/lib/reservas/disponibilidad';
import { applicationFeePercent, getStripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CitaRow, ServicioRow } from '@/lib/supabase/types';
import type Stripe from 'stripe';

/** Minutos que se mantiene bloqueado el hueco esperando el pago del depósito. */
const MINUTOS_BLOQUEO = 15;

/**
 * Recalcula los huecos disponibles para un servicio concreto (hoy).
 * Lo consume el flujo de reserva al cambiar de servicio.
 */
export async function huecosDeServicio(
  negocioSlug: string,
  servicioId: string,
): Promise<string[]> {
  const negocio = await getNegocioPorSlug(negocioSlug);
  if (!negocio) return [];
  const servicios = await getServiciosPublicos(negocio.id);
  const servicio = servicios.find((s) => s.id === servicioId);
  if (!servicio) return [];
  return getHuecosDisponibles(negocio.id, servicio, new Date());
}

export interface DatosReserva {
  negocioSlug: string;
  servicioId: string;
  /** ISO 8601 del inicio de la cita. */
  inicioISO: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  consentimientoRgpd: boolean;
}

export interface ResultadoReserva {
  ok: boolean;
  error?: string;
  /** Presente cuando hay depósito: URL de Stripe Checkout. */
  checkoutUrl?: string;
  /** Presente cuando no hay depósito: la reserva queda confirmada. */
  tokenGestion?: string;
}

/**
 * Crea una reserva pública:
 *  1. Valida datos y consentimiento RGPD.
 *  2. Localiza (o crea) el cliente en el negocio.
 *  3. Inserta la cita en PENDIENTE_PAGO con `expira_en`.
 *  4. Si hay depósito y Stripe está activo → Stripe Checkout.
 *     Si no hay depósito → confirma directamente.
 *
 * Usa el cliente admin porque el visitante no está autenticado; la seguridad
 * se garantiza validando el `negocio_id` resuelto por slug.
 */
export async function crearReserva(
  datos: DatosReserva,
): Promise<ResultadoReserva> {
  if (!datos.consentimientoRgpd) {
    return { ok: false, error: 'Debes aceptar la política de privacidad.' };
  }
  if (!datos.cliente.nombre.trim() || !datos.cliente.email.trim()) {
    return { ok: false, error: 'Nombre y email son obligatorios.' };
  }

  if (!hasSupabaseAdmin()) {
    // Modo demo sin backend: simula éxito para poder probar el flujo visual.
    return { ok: true, tokenGestion: 'demo' };
  }

  const supabase = createAdminClient();

  // 1. Negocio por slug.
  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, stripe_account_id')
    .eq('slug', datos.negocioSlug)
    .maybeSingle<{
      id: string;
      nombre: string;
      stripe_account_id: string | null;
    }>();

  if (!negocio) return { ok: false, error: 'Negocio no encontrado.' };

  // 2. Servicio (para duración, precio y depósito).
  const { data: servicio } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', datos.servicioId)
    .eq('negocio_id', negocio.id)
    .eq('activo', true)
    .maybeSingle<ServicioRow>();

  if (!servicio) return { ok: false, error: 'Servicio no disponible.' };

  const inicio = new Date(datos.inicioISO);
  if (Number.isNaN(inicio.getTime()) || inicio.getTime() < Date.now()) {
    return { ok: false, error: 'La hora seleccionada no es válida.' };
  }
  const fin = new Date(inicio.getTime() + servicio.duracion_min * 60_000);

  // 3. Cliente: reutiliza por email o lo crea.
  let clienteId: string;
  const emailNorm = datos.cliente.email.trim().toLowerCase();
  const { data: existente } = await supabase
    .from('clientes')
    .select('id')
    .eq('negocio_id', negocio.id)
    .eq('email', emailNorm)
    .maybeSingle<{ id: string }>();

  if (existente) {
    clienteId = existente.id;
  } else {
    const { data: nuevo, error: errCliente } = await supabase
      .from('clientes')
      .insert({
        negocio_id: negocio.id,
        nombre: datos.cliente.nombre.trim(),
        email: emailNorm,
        telefono: datos.cliente.telefono.trim() || null,
        consentimiento_rgpd: true,
        consentimiento_fecha: new Date().toISOString(),
      })
      .select('id')
      .single<{ id: string }>();

    if (errCliente || !nuevo) {
      return { ok: false, error: 'No se pudo registrar el cliente.' };
    }
    clienteId = nuevo.id;
  }

  // 4. Cita PENDIENTE_PAGO con bloqueo temporal.
  const deposito = calcularDeposito(
    servicio.precio_cents,
    servicio.deposito_tipo,
    servicio.deposito_valor,
  );
  const expiraEn = new Date(Date.now() + MINUTOS_BLOQUEO * 60_000);

  const { data: cita, error: errCita } = await supabase
    .from('citas')
    .insert({
      negocio_id: negocio.id,
      cliente_id: clienteId,
      servicio_id: servicio.id,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      estado: deposito > 0 ? 'PENDIENTE_PAGO' : 'CONFIRMADA',
      deposito_importe_cents: deposito,
      expira_en: deposito > 0 ? expiraEn.toISOString() : null,
    })
    .select('*')
    .single<CitaRow>();

  if (errCita || !cita) {
    return { ok: false, error: 'No se pudo crear la reserva.' };
  }

  // Sin depósito → confirmada directamente.
  if (deposito <= 0) {
    await programarRecordatorioCita(supabase, {
      negocioId: negocio.id,
      citaId: cita.id,
      inicioISO: cita.inicio,
    });
    await emailConfirmacionReserva({
      to: emailNorm,
      clienteNombre: datos.cliente.nombre.trim(),
      negocioNombre: negocio.nombre,
      servicioNombre: servicio.nombre,
      fechaTexto: inicio.toLocaleString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }),
      tokenGestion: cita.token_gestion,
    });
    return { ok: true, tokenGestion: cita.token_gestion };
  }

  // Con depósito pero sin Stripe configurado → deja la cita pendiente.
  if (!hasStripe()) {
    return {
      ok: true,
      tokenGestion: cita.token_gestion,
      error: 'Pago no disponible; la reserva quedó pendiente de confirmación.',
    };
  }

  // 5. Stripe Checkout para el depósito.
  try {
    const stripe = getStripe();
    const base = appUrl();

    // La comisión (application fee) solo es válida cuando el negocio tiene una
    // cuenta de Stripe Connect conectada; si no, se cobra sin reparto.
    const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData =
      {
        metadata: {
          cita_id: cita.id,
          negocio_id: negocio.id,
          tipo: 'deposito_reserva',
        },
      };
    if (negocio.stripe_account_id) {
      paymentIntentData.application_fee_amount = Math.round(
        (deposito * applicationFeePercent()) / 100,
      );
      paymentIntentData.transfer_data = {
        destination: negocio.stripe_account_id,
      };
    }

    // Stripe Checkout exige que expires_at esté entre 30 min y 24 h en el
    // futuro. El bloqueo del hueco (15 min) lo gestiona el cron por separado.
    const expiraCheckout = Math.floor(Date.now() / 1000) + 30 * 60;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: emailNorm,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: deposito,
            product_data: {
              name: `Depósito · ${servicio.nombre}`,
              description: `Reserva en ${datos.negocioSlug}`,
            },
          },
        },
      ],
      payment_intent_data: paymentIntentData,
      metadata: {
        cita_id: cita.id,
        negocio_id: negocio.id,
      },
      success_url: `${base}/cita/${cita.token_gestion}?pago=ok`,
      cancel_url: `${base}/reservar/${datos.negocioSlug}?pago=cancelado`,
      expires_at: expiraCheckout,
    });

    if (!session.url) {
      return { ok: false, error: 'No se pudo iniciar el pago.' };
    }

    // Guarda el PaymentIntent para conciliar en el webhook.
    if (typeof session.payment_intent === 'string') {
      await supabase
        .from('citas')
        .update({ stripe_payment_intent_id: session.payment_intent })
        .eq('id', cita.id);
    }

    return { ok: true, checkoutUrl: session.url };
  } catch {
    return { ok: false, error: 'Error al conectar con la pasarela de pago.' };
  }
}
