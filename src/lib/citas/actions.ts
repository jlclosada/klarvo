'use server';

import type { EstadoCita } from '@/lib/config';
import { hasSupabase, hasSupabaseAdmin } from '@/lib/env';
import {
  emitirFacturaDeCita,
  type ResultadoFactura,
} from '@/lib/facturacion/actions';
import { programarRecordatorioCita } from '@/lib/notificaciones/programar';
import { createClient } from '@/lib/supabase/server';
import type { ServicioRow } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface ResultadoAccion {
  ok: boolean;
  error?: string;
}

const ESTADOS_NO_COMPLETABLES: EstadoCita[] = [
  'FACTURADA',
  'CANCELADA_CLIENTE',
  'CANCELADA_NEGOCIO',
  'NO_SHOW',
];

/**
 * Marca una cita como COMPLETADA. La pertenencia al negocio se valida vía RLS
 * al leer y actualizar la cita con el cliente autenticado.
 */
export async function completarCita(citaId: string): Promise<ResultadoAccion> {
  if (!hasSupabase()) {
    return { ok: false, error: 'Conecta Supabase para gestionar citas.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado.' };

  const { data: cita } = await supabase
    .from('citas')
    .select('id, estado')
    .eq('id', citaId)
    .maybeSingle<{ id: string; estado: EstadoCita }>();

  if (!cita) return { ok: false, error: 'Cita no encontrada.' };
  if (cita.estado === 'COMPLETADA') return { ok: true };
  if (ESTADOS_NO_COMPLETABLES.includes(cita.estado)) {
    return { ok: false, error: 'Esta cita no puede completarse.' };
  }

  const { error } = await supabase
    .from('citas')
    .update({ estado: 'COMPLETADA' })
    .eq('id', citaId);

  if (error) return { ok: false, error: 'No se pudo completar la cita.' };

  revalidatePath('/app/calendario');
  return { ok: true };
}

/**
 * Completa la cita y emite su factura en un solo paso. Reutiliza la lógica de
 * facturación encadenada (SHA-256) de la Fase 2.
 */
export async function completarYFacturarCita(
  citaId: string,
): Promise<ResultadoFactura> {
  if (!hasSupabaseAdmin()) {
    return { ok: false, error: 'Facturación no disponible en modo demo.' };
  }

  const completar = await completarCita(citaId);
  if (!completar.ok) {
    return { ok: false, error: completar.error };
  }

  const resultado = await emitirFacturaDeCita(citaId);
  revalidatePath('/app/calendario');
  return resultado;
}

/** Esquema de una cita creada manualmente desde el panel. */
const citaManualSchema = z.object({
  servicioId: z.string().uuid('Selecciona un servicio.'),
  // Cliente existente por id, o nombre para crear uno nuevo al vuelo.
  clienteId: z.string().uuid().optional(),
  clienteNombre: z.string().trim().max(120).optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida.'),
});

export interface ResultadoCitaManual extends ResultadoAccion {
  citaId?: string;
}

/**
 * Crea una cita manualmente desde el calendario del negocio. La duración se
 * toma del servicio; el estado inicial es CONFIRMADA (cita presencial pactada).
 * Si se pasa `clienteNombre` sin `clienteId`, se crea el cliente al vuelo.
 */
export async function crearCitaManual(
  input: z.input<typeof citaManualSchema>,
): Promise<ResultadoCitaManual> {
  if (!hasSupabase()) {
    return { ok: false, error: 'Conecta Supabase para crear citas.' };
  }

  const parsed = citaManualSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
    };
  }
  const { servicioId, clienteId, clienteNombre, fecha, hora } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado.' };

  const { data: miembro } = await supabase
    .from('miembros')
    .select('negocio_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle<{ negocio_id: string }>();
  if (!miembro) return { ok: false, error: 'No se encontró tu negocio.' };
  const negocioId = miembro.negocio_id;

  // Servicio (duración + validación de pertenencia vía RLS).
  const { data: servicio } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', servicioId)
    .maybeSingle<ServicioRow>();
  if (!servicio) return { ok: false, error: 'Servicio no disponible.' };

  // Cliente: existente o creado al vuelo por nombre.
  let clienteFinal: string | null = clienteId ?? null;
  if (!clienteFinal && clienteNombre?.trim()) {
    const { data: nuevo, error: errCliente } = await supabase
      .from('clientes')
      .insert({ negocio_id: negocioId, nombre: clienteNombre.trim() })
      .select('id')
      .single<{ id: string }>();
    if (errCliente || !nuevo) {
      return { ok: false, error: 'No se pudo crear el cliente.' };
    }
    clienteFinal = nuevo.id;
  }

  // Construye inicio/fin en hora local del servidor.
  const inicio = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(inicio.getTime())) {
    return { ok: false, error: 'Fecha u hora no válidas.' };
  }
  const fin = new Date(inicio.getTime() + servicio.duracion_min * 60_000);

  const { data: cita, error } = await supabase
    .from('citas')
    .insert({
      negocio_id: negocioId,
      cliente_id: clienteFinal,
      servicio_id: servicioId,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      estado: 'CONFIRMADA',
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !cita) return { ok: false, error: 'No se pudo crear la cita.' };

  await programarRecordatorioCita(supabase, {
    negocioId,
    citaId: cita.id,
    inicioISO: inicio.toISOString(),
  });

  revalidatePath('/app/calendario');
  revalidatePath('/app');
  return { ok: true, citaId: cita.id };
}
