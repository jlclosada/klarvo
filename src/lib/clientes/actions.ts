'use server';

import { hasSupabase } from '@/lib/env';
import type { ResultadoAccion } from '@/lib/servicios/actions';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const clienteSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es demasiado corto.').max(120),
  email: z
    .string()
    .trim()
    .email('Email no válido.')
    .max(160)
    .optional()
    .or(z.literal('')),
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
  etiquetas: z.array(z.string().trim().max(30)).max(10).optional(),
});

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

/** Crea un cliente en el negocio del usuario en sesión. */
export async function crearCliente(
  input: z.input<typeof clienteSchema>,
): Promise<ResultadoAccion> {
  if (!hasSupabase()) {
    return { ok: false, error: 'Conecta Supabase para guardar clientes.' };
  }

  const parsed = clienteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
    };
  }

  const negocioId = await negocioIdActual();
  if (!negocioId) return { ok: false, error: 'No autenticado.' };

  const supabase = await createClient();
  const { error } = await supabase.from('clientes').insert({
    negocio_id: negocioId,
    nombre: parsed.data.nombre,
    email: parsed.data.email ? parsed.data.email.toLowerCase() : null,
    telefono: parsed.data.telefono || null,
    etiquetas: parsed.data.etiquetas ?? [],
  });

  if (error) return { ok: false, error: 'No se pudo crear el cliente.' };

  revalidatePath('/app/clientes');
  return { ok: true };
}
