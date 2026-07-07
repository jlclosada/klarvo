import { emailConfirmacionReserva } from '@/lib/email/resend';
import { hasSupabaseAdmin } from '@/lib/env';
import { programarRecordatorioCita } from '@/lib/notificaciones/programar';
import { getStripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook de Stripe. Procesa eventos de depósitos y suscripciones.
 *
 * Seguridad:
 *  - Verifica la firma con STRIPE_WEBHOOK_SECRET.
 *  - Idempotencia: cada event.id se registra en la tabla `eventos_stripe`
 *    antes de aplicar efectos, para no doble-cobrar ni doble-facturar.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook no configurado' },
      { status: 503 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firma inválida';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Idempotencia: si el evento ya se registró, no reprocesar.
  if (hasSupabaseAdmin()) {
    const supabase = createAdminClient();
    const { error: insertError } = await supabase
      .from('eventos_stripe')
      .insert({ event_id: event.id, tipo: event.type });

    // Violación de PK (23505) → evento ya procesado.
    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ received: true, duplicate: true });
      }
      return NextResponse.json(
        { error: 'No se pudo registrar el evento' },
        { status: 500 },
      );
    }

    try {
      await procesarEvento(event, supabase);
    } catch {
      // Permite reintento de Stripe: borra el registro para no bloquear.
      await supabase.from('eventos_stripe').delete().eq('event_id', event.id);
      return NextResponse.json(
        { error: 'Error al procesar el evento' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}

type AdminClient = ReturnType<typeof createAdminClient>;

/** Aplica los efectos de negocio de cada tipo de evento. */
async function procesarEvento(event: Stripe.Event, supabase: AdminClient) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const citaId = pi.metadata?.cita_id;
      if (pi.metadata?.tipo === 'deposito_reserva' && citaId) {
        // Depósito cobrado → confirmar cita y liberar el bloqueo temporal.
        await supabase
          .from('citas')
          .update({
            estado: 'CONFIRMADA',
            deposito_pagado: true,
            stripe_payment_intent_id: pi.id,
            expira_en: null,
          })
          .eq('id', citaId)
          .eq('estado', 'PENDIENTE_PAGO');

        // Email de confirmación con enlace de gestión.
        const { data: cita } = await supabase
          .from('citas')
          .select(
            'negocio_id, inicio, token_gestion, negocios(nombre), servicios(nombre), clientes(nombre, email)',
          )
          .eq('id', citaId)
          .maybeSingle<{
            negocio_id: string;
            inicio: string;
            token_gestion: string;
            negocios: { nombre: string } | null;
            servicios: { nombre: string } | null;
            clientes: { nombre: string; email: string | null } | null;
          }>();

        if (cita) {
          await programarRecordatorioCita(supabase, {
            negocioId: cita.negocio_id,
            citaId,
            inicioISO: cita.inicio,
          });
        }

        if (cita?.clientes?.email) {
          await emailConfirmacionReserva({
            to: cita.clientes.email,
            clienteNombre: cita.clientes.nombre,
            negocioNombre: cita.negocios?.nombre ?? 'tu cita',
            servicioNombre: cita.servicios?.nombre ?? 'Servicio',
            fechaTexto: new Date(cita.inicio).toLocaleString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }),
            tokenGestion: cita.token_gestion,
          });
        }
      }
      break;
    }
    case 'payment_intent.payment_failed':
      // Pago fallido → la cita permanece PENDIENTE_PAGO y expira por cron.
      break;
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const citaId = charge.metadata?.cita_id;
      if (citaId) {
        await supabase
          .from('citas')
          .update({ estado: 'CANCELADA_CLIENTE' })
          .eq('id', citaId);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const negocioId = sub.metadata?.negocio_id;
      if (negocioId) {
        const estado =
          sub.status === 'active' || sub.status === 'trialing'
            ? 'activa'
            : sub.status === 'past_due' || sub.status === 'unpaid'
              ? 'impago'
              : sub.status === 'canceled'
                ? 'cancelada'
                : 'pausada';
        await supabase
          .from('negocios')
          .update({ estado_suscripcion: estado })
          .eq('id', negocioId);
      }
      break;
    }
    default:
      break;
  }
}
