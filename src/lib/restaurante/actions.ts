'use server';

import { hasSupabase } from '@/lib/env';
import {
  DIAS_SEMANA,
  parseConfigRestaurante,
  type ConfigRestaurante,
} from '@/lib/restaurante/config';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface ResultadoAccion {
  ok: boolean;
  error?: string;
}

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const turnoSchema = z
  .object({
    id: z.string().trim().min(1).max(40),
    nombre: z.string().trim().min(1, 'El turno necesita un nombre.').max(40),
    inicio: z.string().regex(HORA_RE, 'Hora de inicio inválida.'),
    fin: z.string().regex(HORA_RE, 'Hora de fin inválida.'),
  })
  .refine((t) => t.fin > t.inicio, {
    message: 'El fin del turno debe ser posterior al inicio.',
  });

const configSchema = z.object({
  mesasPorDia: z.record(z.enum(DIAS_SEMANA), z.number().int().min(0).max(500)),
  capacidadPorMesa: z.number().int().min(1).max(50),
  tamanoMaxGrupo: z.number().int().min(1).max(100),
  duracionMesaMin: z.number().int().min(30).max(480),
  turnos: z.array(turnoSchema).min(1, 'Configura al menos un turno.'),
});

/**
 * Guarda la configuración de reservas de restauración del negocio en sesión
 * (turnos, mesas por día, aforo por mesa y tamaño máximo de grupo).
 */
export async function guardarConfigRestaurante(
  input: ConfigRestaurante,
): Promise<ResultadoAccion> {
  if (!hasSupabase()) {
    return {
      ok: false,
      error: 'Conecta Supabase para guardar la configuración.',
    };
  }

  const parsed = configSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Configuración inválida.',
    };
  }

  // Normaliza de nuevo para garantizar una estructura consistente en la BD.
  const config = parseConfigRestaurante(parsed.data);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado.' };

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (!negocio) return { ok: false, error: 'Negocio no encontrado.' };

  const { error } = await supabase
    .from('negocios')
    .update({ config_restaurante_json: config })
    .eq('id', negocio.id);

  if (error) {
    return { ok: false, error: 'No se pudo guardar la configuración.' };
  }

  revalidatePath('/app');
  revalidatePath('/app/ajustes');
  revalidatePath('/app/onboarding');
  return { ok: true };
}
