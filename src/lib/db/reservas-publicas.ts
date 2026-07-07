import 'server-only';

import { hasSupabaseAdmin } from '@/lib/env';
import { mockNegocio, mockServicios } from '@/lib/mock';
import { calcularHuecos, type Intervalo } from '@/lib/reservas/disponibilidad';
import { createAdminClient } from '@/lib/supabase/admin';
import type { NegocioRow, ServicioRow } from '@/lib/supabase/types';

/**
 * Consultas de la reserva pública. No requieren sesión, por lo que usan el
 * cliente admin (validando siempre por `slug`/`negocio_id`). Si Supabase no
 * está configurado, devuelven datos de demostración para no bloquear el frontend.
 */

export interface NegocioPublico {
  id: string;
  nombre: string;
  slug: string;
  vertical: string;
  configurado: boolean;
}

export interface ServicioPublico {
  id: string;
  nombre: string;
  duracionMin: number;
  bufferMin: number;
  precioCents: number;
  depositoTipo: 'porcentaje' | 'fijo' | 'ninguno';
  depositoValor: number;
}

function servicioDeRow(s: ServicioRow): ServicioPublico {
  return {
    id: s.id,
    nombre: s.nombre,
    duracionMin: s.duracion_min,
    bufferMin: s.buffer_min,
    precioCents: s.precio_cents,
    depositoTipo: s.deposito_tipo,
    depositoValor: s.deposito_valor,
  };
}

/** Devuelve el negocio por su slug público, o null si no existe. */
export async function getNegocioPorSlug(
  slug: string,
): Promise<NegocioPublico | null> {
  if (!hasSupabaseAdmin()) {
    // Modo demo: cualquier slug resuelve al negocio de ejemplo.
    return {
      id: 'demo',
      nombre: mockNegocio.nombre,
      slug,
      vertical: mockNegocio.vertical,
      configurado: false,
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('negocios')
    .select('id, nombre, slug, vertical')
    .eq('slug', slug)
    .maybeSingle<Pick<NegocioRow, 'id' | 'nombre' | 'slug' | 'vertical'>>();

  if (error || !data) return null;

  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    vertical: data.vertical,
    configurado: true,
  };
}

/** Servicios activos de un negocio para la página de reservas. */
export async function getServiciosPublicos(
  negocioId: string,
): Promise<ServicioPublico[]> {
  if (!hasSupabaseAdmin() || negocioId === 'demo') {
    return mockServicios
      .filter((s) => s.activo)
      .map((s) => ({
        id: s.id,
        nombre: s.nombre,
        duracionMin: s.duracionMin,
        bufferMin: 0,
        precioCents: s.precioCents,
        depositoTipo: s.depositoTipo,
        depositoValor: s.depositoValor,
      }));
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('negocio_id', negocioId)
    .eq('activo', true)
    .order('creado_en', { ascending: true })
    .returns<ServicioRow[]>();

  if (error || !data) return [];
  return data.map(servicioDeRow);
}

/**
 * Calcula los huecos disponibles de un servicio en una fecha concreta.
 * Usa el horario del negocio (por ahora 9–19h por defecto) y descuenta las
 * citas ya ocupadas ese día.
 */
export async function getHuecosDisponibles(
  negocioId: string,
  servicio: ServicioPublico,
  fecha: Date,
): Promise<string[]> {
  const horario = { aperturaMin: 9 * 60, cierreMin: 19 * 60 };

  let ocupadas: Intervalo[] = [];

  if (hasSupabaseAdmin() && negocioId !== 'demo') {
    const supabase = createAdminClient();
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);

    const { data } = await supabase
      .from('citas')
      .select('inicio, fin, estado')
      .eq('negocio_id', negocioId)
      .gte('inicio', inicioDia.toISOString())
      .lt('inicio', finDia.toISOString())
      .in('estado', [
        'PENDIENTE_PAGO',
        'CONFIRMADA',
        'RECORDADA',
        'COMPLETADA',
      ]);

    ocupadas = (data ?? []).map((c) => ({
      inicio: new Date(c.inicio),
      fin: new Date(c.fin),
    }));
  }

  const huecos = calcularHuecos({
    fecha,
    horario,
    duracionMin: servicio.duracionMin,
    bufferMin: servicio.bufferMin,
    pasoMin: 15,
    ocupadas,
  });

  const ahora = new Date();
  return huecos
    .filter((h) => h.getTime() > ahora.getTime())
    .map((h) =>
      h.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    );
}
