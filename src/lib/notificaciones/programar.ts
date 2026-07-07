import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

/** Horas antes del inicio de la cita en que se envía el recordatorio. */
const HORAS_ANTES = 24;

/**
 * Programa un recordatorio por email para una cita. Inserta una fila en
 * `notificaciones` con `programada_en = inicio - 24 h`. Si ese instante ya
 * pasó (cita en menos de 24 h) no programa nada, porque el recordatorio
 * carecería de sentido.
 *
 * Nunca lanza: un fallo aquí no debe romper la creación de la cita.
 */
export async function programarRecordatorioCita(
  supabase: SupabaseClient,
  params: { negocioId: string; citaId: string; inicioISO: string },
): Promise<void> {
  const programadaEn = new Date(
    new Date(params.inicioISO).getTime() - HORAS_ANTES * 60 * 60 * 1000,
  );

  if (programadaEn.getTime() <= Date.now()) return;

  try {
    await supabase.from('notificaciones').insert({
      negocio_id: params.negocioId,
      cita_id: params.citaId,
      canal: 'email',
      estado: 'programada',
      programada_en: programadaEn.toISOString(),
    });
  } catch {
    // Silencioso a propósito.
  }
}
