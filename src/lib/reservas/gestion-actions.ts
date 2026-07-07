'use server';

import { hasStripe, hasSupabaseAdmin } from '@/lib/env';
import { reembolsoPorCancelacion } from '@/lib/reservas/disponibilidad';
import { getStripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/** Horas antes del inicio en que la cancelación da derecho a reembolso. */
const VENTANA_REEMBOLSO_HORAS = 24;

export interface ResultadoCancelacion {
  ok: boolean;
  error?: string;
  reembolsado?: boolean;
}

/**
 * Cancela una cita desde el enlace público de gestión (por token).
 * Si el depósito se pagó y la cancelación entra dentro de la ventana, se emite
 * el reembolso vía Stripe. El token actúa como credencial del recurso.
 */
export async function cancelarCitaPorToken(
  token: string,
): Promise<ResultadoCancelacion> {
  if (!hasSupabaseAdmin() || token === 'demo') {
    return { ok: true, reembolsado: true };
  }

  const supabase = createAdminClient();

  const { data: cita } = await supabase
    .from('citas')
    .select('id, inicio, estado, deposito_pagado, stripe_payment_intent_id')
    .eq('token_gestion', token)
    .maybeSingle<{
      id: string;
      inicio: string;
      estado: string;
      deposito_pagado: boolean;
      stripe_payment_intent_id: string | null;
    }>();

  if (!cita) return { ok: false, error: 'Reserva no encontrada.' };

  const cancelable =
    cita.estado === 'CONFIRMADA' ||
    cita.estado === 'PENDIENTE_PAGO' ||
    cita.estado === 'RECORDADA';
  if (!cancelable) {
    return { ok: false, error: 'Esta reserva ya no se puede cancelar.' };
  }

  const inicio = new Date(cita.inicio);
  const conDerechoReembolso = reembolsoPorCancelacion(
    inicio,
    new Date(),
    VENTANA_REEMBOLSO_HORAS,
  );

  let reembolsado = false;

  if (
    conDerechoReembolso &&
    cita.deposito_pagado &&
    cita.stripe_payment_intent_id &&
    hasStripe()
  ) {
    try {
      await getStripe().refunds.create({
        payment_intent: cita.stripe_payment_intent_id,
        metadata: { cita_id: cita.id, motivo: 'cancelacion_cliente' },
      });
      reembolsado = true;
    } catch {
      // No bloquea la cancelación; el reembolso se puede reintentar manualmente.
    }
  }

  const { error } = await supabase
    .from('citas')
    .update({ estado: 'CANCELADA_CLIENTE' })
    .eq('id', cita.id);

  if (error) return { ok: false, error: 'No se pudo cancelar la reserva.' };

  revalidatePath(`/cita/${token}`);
  return { ok: true, reembolsado };
}
