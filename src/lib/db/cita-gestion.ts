import 'server-only';

import { hasSupabaseAdmin } from '@/lib/env';
import { mockNegocio, mockServicios } from '@/lib/mock';
import { createAdminClient } from '@/lib/supabase/admin';
import type { EstadoCitaDB } from '@/lib/supabase/types';

/** Vista de una cita para la página pública de gestión (por token). */
export interface CitaGestion {
  id: string;
  negocioNombre: string;
  servicioNombre: string;
  inicioISO: string;
  estado: EstadoCitaDB;
  depositoCents: number;
  depositoPagado: boolean;
  clienteNombre: string;
  puedeCancelar: boolean;
}

/**
 * Recupera una cita por su token de gestión (enlace del email al cliente).
 * No requiere sesión; el token actúa como credencial de un solo recurso.
 */
export async function getCitaPorToken(
  token: string,
): Promise<CitaGestion | null> {
  // Modo demo: token "demo" muestra una cita de ejemplo.
  if (!hasSupabaseAdmin() || token === 'demo') {
    const inicio = new Date();
    inicio.setHours(inicio.getHours() + 26, 0, 0, 0);
    const servicio = mockServicios[0];
    return {
      id: 'demo',
      negocioNombre: mockNegocio.nombre,
      servicioNombre: servicio.nombre,
      inicioISO: inicio.toISOString(),
      estado: 'CONFIRMADA',
      depositoCents: 750,
      depositoPagado: true,
      clienteNombre: 'Cliente de ejemplo',
      puedeCancelar: true,
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('citas')
    .select(
      `id, inicio, estado, deposito_importe_cents, deposito_pagado,
       negocios(nombre), servicios(nombre), clientes(nombre)`,
    )
    .eq('token_gestion', token)
    .maybeSingle<{
      id: string;
      inicio: string;
      estado: EstadoCitaDB;
      deposito_importe_cents: number;
      deposito_pagado: boolean;
      negocios: { nombre: string } | null;
      servicios: { nombre: string } | null;
      clientes: { nombre: string } | null;
    }>();

  if (error || !data) return null;

  const inicio = new Date(data.inicio);
  const activa =
    data.estado === 'CONFIRMADA' ||
    data.estado === 'PENDIENTE_PAGO' ||
    data.estado === 'RECORDADA';

  return {
    id: data.id,
    negocioNombre: data.negocios?.nombre ?? 'El negocio',
    servicioNombre: data.servicios?.nombre ?? 'Servicio',
    inicioISO: data.inicio,
    estado: data.estado,
    depositoCents: data.deposito_importe_cents,
    depositoPagado: data.deposito_pagado,
    clienteNombre: data.clientes?.nombre ?? '',
    puedeCancelar: activa && inicio.getTime() > Date.now(),
  };
}
