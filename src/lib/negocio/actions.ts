'use server';

import { hasSupabase } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface ResultadoAccion {
  ok: boolean;
  error?: string;
}

// Horario: mapa de día (lun..dom) a lista de rangos [apertura, cierre].
const rangoSchema = z.tuple([z.string(), z.string()]);
const horarioSchema = z.record(z.string(), z.array(rangoSchema));

/** Guarda el horario de apertura del negocio del usuario en sesión. */
export async function guardarHorarioNegocio(
  horario: unknown,
): Promise<ResultadoAccion> {
  if (!hasSupabase()) {
    return { ok: false, error: 'Conecta Supabase para guardar el horario.' };
  }

  const parsed = horarioSchema.safeParse(horario);
  if (!parsed.success) return { ok: false, error: 'Horario inválido.' };

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
    .update({ horario_json: parsed.data })
    .eq('id', negocio.id);

  if (error) return { ok: false, error: 'No se pudo guardar el horario.' };

  revalidatePath('/app');
  revalidatePath('/app/onboarding');
  revalidatePath('/app/ajustes');
  return { ok: true };
}

// Datos del negocio + fiscales editables desde Ajustes.
const datosNegocioSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es demasiado corto.').max(120),
  nif: z.string().trim().max(20).optional(),
  direccion: z.string().trim().max(200).optional(),
  poblacion: z.string().trim().max(120).optional(),
  cp: z.string().trim().max(10).optional(),
});

/**
 * Guarda el nombre y los datos fiscales del negocio del usuario en sesión.
 * Los datos fiscales se almacenan en datos_fiscales_json (usados al facturar).
 */
export async function guardarDatosNegocio(
  input: z.input<typeof datosNegocioSchema>,
): Promise<ResultadoAccion> {
  if (!hasSupabase()) {
    return { ok: false, error: 'Conecta Supabase para guardar los datos.' };
  }

  const parsed = datosNegocioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
    };
  }

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

  const { nombre, nif, direccion, poblacion, cp } = parsed.data;
  const { error } = await supabase
    .from('negocios')
    .update({
      nombre,
      datos_fiscales_json: {
        nif: nif ?? '',
        direccion: direccion ?? '',
        poblacion: poblacion ?? '',
        cp: cp ?? '',
      },
    })
    .eq('id', negocio.id);

  if (error) return { ok: false, error: 'No se pudieron guardar los datos.' };

  revalidatePath('/app');
  revalidatePath('/app/ajustes');
  return { ok: true };
}
