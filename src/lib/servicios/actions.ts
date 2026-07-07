'use server';

import { hasSupabase } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/** Esquema de validación de un servicio. Precio y depósito en céntimos. */
const servicioSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es demasiado corto.').max(80),
  duracionMin: z.coerce.number().int().min(5).max(600),
  precioCents: z.coerce.number().int().min(0).max(10_000_00),
  depositoTipo: z.enum(['ninguno', 'fijo', 'porcentaje']),
  depositoValor: z.coerce.number().int().min(0).max(10_000_00),
});

export interface ResultadoAccion {
  ok: boolean;
  error?: string;
}

async function negocioIdActual(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('miembros')
    .select('negocio_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle<{ negocio_id: string }>();
  return data?.negocio_id ?? null;
}

/** Crea un servicio en el negocio del usuario en sesión. */
export async function crearServicio(
  input: z.input<typeof servicioSchema>,
): Promise<ResultadoAccion> {
  if (!hasSupabase()) {
    return { ok: false, error: 'Conecta Supabase para guardar servicios.' };
  }

  const parsed = servicioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
    };
  }

  const negocioId = await negocioIdActual();
  if (!negocioId) return { ok: false, error: 'No autenticado.' };

  const supabase = await createClient();
  const { error } = await supabase.from('servicios').insert({
    negocio_id: negocioId,
    nombre: parsed.data.nombre,
    duracion_min: parsed.data.duracionMin,
    precio_cents: parsed.data.precioCents,
    deposito_tipo: parsed.data.depositoTipo,
    deposito_valor:
      parsed.data.depositoTipo === 'ninguno' ? 0 : parsed.data.depositoValor,
  });

  if (error) return { ok: false, error: 'No se pudo crear el servicio.' };

  revalidatePath('/app/servicios');
  return { ok: true };
}

/** Activa o pausa un servicio. */
export async function alternarServicio(
  id: string,
  activo: boolean,
): Promise<ResultadoAccion> {
  if (!hasSupabase()) return { ok: false, error: 'Conecta Supabase.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('servicios')
    .update({ activo })
    .eq('id', id);

  if (error) return { ok: false, error: 'No se pudo actualizar.' };
  revalidatePath('/app/servicios');
  return { ok: true };
}
