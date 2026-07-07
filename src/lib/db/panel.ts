import 'server-only';

import { esVerticalRestauracion, type EstadoCita } from '@/lib/config';
import { hasSupabase } from '@/lib/env';
import {
  mockCitasHoy,
  mockClientes,
  mockFacturas,
  mockMetricas,
  mockNegocio,
  mockServicios,
} from '@/lib/mock';
import {
  CONFIG_RESTAURANTE_DEFECTO,
  parseConfigRestaurante,
  type ConfigRestaurante,
} from '@/lib/restaurante/config';
import { createClient } from '@/lib/supabase/server';
import type {
  ClienteRow,
  FacturaRow,
  NegocioRow,
  ServicioRow,
} from '@/lib/supabase/types';
/**
 * Capa de datos del panel autenticado. Cada consulta pasa por el cliente de
 * servidor con la sesión del usuario, de modo que Row Level Security garantiza
 * que solo se ven los datos del negocio propio. Si Supabase no está configurado,
 * se devuelven datos de demostración para poder navegar el panel.
 */

export interface NegocioPanel {
  id: string;
  nombre: string;
  slug: string;
  vertical: string;
  plan: string;
  demo: boolean;
}

/** Negocio del usuario en sesión (o demo). null si autenticado sin negocio. */
export async function getMiNegocio(): Promise<NegocioPanel | null> {
  if (!hasSupabase()) {
    return {
      id: 'demo',
      nombre: mockNegocio.nombre,
      slug: mockNegocio.slug,
      vertical: mockNegocio.vertical,
      plan: mockNegocio.plan,
      demo: true,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('negocios')
    .select('id, nombre, slug, vertical, plan')
    .limit(1)
    .maybeSingle<
      Pick<NegocioRow, 'id' | 'nombre' | 'slug' | 'vertical' | 'plan'>
    >();

  if (!data) return null;
  return { ...data, demo: false };
}

export interface DatosFiscales {
  nif: string;
  direccion: string;
  poblacion: string;
  cp: string;
}

export type HorarioSemana = Record<string, [string, string][]>;

export interface NegocioAjustes {
  id: string;
  nombre: string;
  slug: string;
  vertical: string;
  plan: string;
  horario: HorarioSemana;
  fiscales: DatosFiscales;
  configRestaurante: ConfigRestaurante;
  serieFactura: string;
  proximoNumeroFactura: number;
  demo: boolean;
}

const FISCALES_VACIOS: DatosFiscales = {
  nif: '',
  direccion: '',
  poblacion: '',
  cp: '',
};

/**
 * Datos de configuración del negocio del usuario en sesión, incluyendo horario,
 * datos fiscales y el próximo número de factura de la serie por defecto.
 * En modo demo devuelve valores de ejemplo.
 */
export async function getNegocioAjustes(): Promise<NegocioAjustes | null> {
  if (!hasSupabase()) {
    return {
      id: 'demo',
      nombre: mockNegocio.nombre,
      slug: mockNegocio.slug,
      vertical: mockNegocio.vertical,
      plan: mockNegocio.plan,
      horario: {
        lun: [['09:00', '19:00']],
        mar: [['09:00', '19:00']],
        mie: [['09:00', '19:00']],
        jue: [['09:00', '20:00']],
        vie: [['09:00', '20:00']],
        sab: [['10:00', '14:00']],
        dom: [],
      },
      fiscales: FISCALES_VACIOS,
      configRestaurante: CONFIG_RESTAURANTE_DEFECTO,
      serieFactura: 'A',
      proximoNumeroFactura: 130,
      demo: true,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('negocios')
    .select(
      'id, nombre, slug, vertical, plan, horario_json, datos_fiscales_json, config_restaurante_json',
    )
    .limit(1)
    .maybeSingle<
      Pick<
        NegocioRow,
        | 'id'
        | 'nombre'
        | 'slug'
        | 'vertical'
        | 'plan'
        | 'horario_json'
        | 'datos_fiscales_json'
        | 'config_restaurante_json'
      >
    >();
  if (!data) return null;

  const fiscalesRaw = (data.datos_fiscales_json ??
    {}) as Partial<DatosFiscales>;

  // Próximo número de la serie A (max + 1).
  const { data: ultima } = await supabase
    .from('facturas')
    .select('numero')
    .eq('serie', 'A')
    .order('numero', { ascending: false })
    .limit(1)
    .maybeSingle<{ numero: number }>();

  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    vertical: data.vertical,
    plan: data.plan,
    horario: (data.horario_json ?? {}) as HorarioSemana,
    fiscales: {
      nif: fiscalesRaw.nif ?? '',
      direccion: fiscalesRaw.direccion ?? '',
      poblacion: fiscalesRaw.poblacion ?? '',
      cp: fiscalesRaw.cp ?? '',
    },
    configRestaurante: parseConfigRestaurante(data.config_restaurante_json),
    serieFactura: 'A',
    proximoNumeroFactura: (ultima?.numero ?? 0) + 1,
    demo: false,
  };
}

export interface ServicioPanel {
  id: string;
  nombre: string;
  duracionMin: number;
  precioCents: number;
  depositoTipo: 'porcentaje' | 'fijo' | 'ninguno';
  depositoValor: number;
  activo: boolean;
}

export async function getServicios(): Promise<ServicioPanel[]> {
  if (!hasSupabase()) {
    return mockServicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      duracionMin: s.duracionMin,
      precioCents: s.precioCents,
      depositoTipo: s.depositoTipo,
      depositoValor: s.depositoValor,
      activo: s.activo,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('servicios')
    .select('*')
    .order('creado_en', { ascending: true })
    .returns<ServicioRow[]>();

  return (data ?? []).map((s) => ({
    id: s.id,
    nombre: s.nombre,
    duracionMin: s.duracion_min,
    precioCents: s.precio_cents,
    depositoTipo: s.deposito_tipo,
    depositoValor: s.deposito_valor,
    activo: s.activo,
  }));
}

export interface ClientePanel {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  etiquetas: string[];
  creadoISO: string;
}

export async function getClientes(): Promise<ClientePanel[]> {
  if (!hasSupabase()) {
    return mockClientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      telefono: c.telefono,
      email: c.email,
      etiquetas: c.etiquetas,
      creadoISO: c.ultimaVisita,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('clientes')
    .select('*')
    .order('creado_en', { ascending: false })
    .returns<ClienteRow[]>();

  return (data ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono ?? '',
    email: c.email ?? '',
    etiquetas: c.etiquetas,
    creadoISO: c.creado_en,
  }));
}

export interface FacturaPanel {
  id: string;
  serie: string;
  numero: number;
  fechaISO: string;
  totalCents: number;
  hash: string;
}

export async function getFacturas(): Promise<FacturaPanel[]> {
  if (!hasSupabase()) {
    return mockFacturas
      .filter((f) => f.estado === 'emitida')
      .map((f) => ({
        id: f.id,
        serie: f.serie,
        numero: f.numero,
        fechaISO: f.fechaISO,
        totalCents: f.totalCents,
        hash: f.hash,
      }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('facturas')
    .select('*')
    .order('numero', { ascending: false })
    .returns<FacturaRow[]>();

  return (data ?? []).map((f) => ({
    id: f.id,
    serie: f.serie,
    numero: f.numero,
    fechaISO: f.fecha,
    totalCents: f.total_cents,
    hash: f.hash_actual.slice(0, 6),
  }));
}

export interface FacturaDetalle {
  id: string;
  serie: string;
  numero: number;
  fechaISO: string;
  baseCents: number;
  ivaCents: number;
  totalCents: number;
  nifEmisor: string | null;
  hashActual: string;
  hashAnterior: string;
  qr: string | null;
  negocioNombre: string;
  clienteNombre: string | null;
  servicioNombre: string | null;
}

/**
 * Detalle completo de una factura del negocio del usuario en sesión. Devuelve
 * null en modo demo o si la factura no pertenece al negocio (RLS).
 */
export async function getFacturaDetalle(
  id: string,
): Promise<FacturaDetalle | null> {
  if (!hasSupabase()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('facturas')
    .select(
      'id, serie, numero, fecha, base_cents, iva_cents, total_cents, nif_emisor, hash_actual, hash_anterior, qr, negocios(nombre), citas(clientes(nombre), servicios(nombre))',
    )
    .eq('id', id)
    .maybeSingle<{
      id: string;
      serie: string;
      numero: number;
      fecha: string;
      base_cents: number;
      iva_cents: number;
      total_cents: number;
      nif_emisor: string | null;
      hash_actual: string;
      hash_anterior: string;
      qr: string | null;
      negocios: { nombre: string } | null;
      citas: {
        clientes: { nombre: string } | null;
        servicios: { nombre: string } | null;
      } | null;
    }>();

  if (!data) return null;

  return {
    id: data.id,
    serie: data.serie,
    numero: data.numero,
    fechaISO: data.fecha,
    baseCents: data.base_cents,
    ivaCents: data.iva_cents,
    totalCents: data.total_cents,
    nifEmisor: data.nif_emisor,
    hashActual: data.hash_actual,
    hashAnterior: data.hash_anterior,
    qr: data.qr,
    negocioNombre: data.negocios?.nombre ?? 'Mi negocio',
    clienteNombre: data.citas?.clientes?.nombre ?? null,
    servicioNombre: data.citas?.servicios?.nombre ?? null,
  };
}

export interface MetricasPanel {
  ingresosMesCents: number;
  ingresosMesAnteriorCents: number;
  citasMes: number;
  tasaNoShow: number;
  clientesNuevos: number;
  clientesRecurrentes: number;
  ocupacion: number;
  serie: number[];
}

/**
 * Métricas del negocio. En modo demo devuelve datos de ejemplo; con Supabase
 * calcula ingresos y citas del mes a partir de facturas y citas reales.
 */
export async function getMetricas(): Promise<MetricasPanel> {
  if (!hasSupabase()) {
    return { ...mockMetricas };
  }

  const supabase = await createClient();
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth() - 1,
    1,
  );
  // Inicio de la ventana de 7 semanas (para la serie del gráfico).
  const inicioSerie = new Date(ahora);
  inicioSerie.setHours(0, 0, 0, 0);
  inicioSerie.setDate(inicioSerie.getDate() - 7 * 6);

  const [
    facturasMes,
    facturasPrevio,
    facturasSerie,
    citas,
    citasCompletadas,
    noShows,
    clientesNuevos,
    clientesTotal,
  ] = await Promise.all([
    supabase
      .from('facturas')
      .select('total_cents')
      .gte('fecha', inicioMes.toISOString())
      .returns<{ total_cents: number }[]>(),
    supabase
      .from('facturas')
      .select('total_cents')
      .gte('fecha', inicioMesAnterior.toISOString())
      .lt('fecha', inicioMes.toISOString())
      .returns<{ total_cents: number }[]>(),
    supabase
      .from('facturas')
      .select('total_cents, fecha')
      .gte('fecha', inicioSerie.toISOString())
      .returns<{ total_cents: number; fecha: string }[]>(),
    supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })
      .gte('inicio', inicioMes.toISOString()),
    supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })
      .in('estado', ['COMPLETADA', 'FACTURADA'])
      .gte('inicio', inicioMes.toISOString()),
    supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'NO_SHOW')
      .gte('inicio', inicioMes.toISOString()),
    supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .gte('creado_en', inicioMes.toISOString()),
    supabase.from('clientes').select('id', { count: 'exact', head: true }),
  ]);

  const ingresosMesCents = (facturasMes.data ?? []).reduce(
    (a, f) => a + f.total_cents,
    0,
  );
  const ingresosMesAnteriorCents = (facturasPrevio.data ?? []).reduce(
    (a, f) => a + f.total_cents,
    0,
  );
  const citasMes = citas.count ?? 0;
  const tasaNoShow = citasMes ? ((noShows.count ?? 0) / citasMes) * 100 : 0;
  const totalClientes = clientesTotal.count ?? 0;
  const nuevos = clientesNuevos.count ?? 0;
  const clientesRecurrentes = Math.max(0, totalClientes - nuevos);
  // Ocupación: citas efectivas sobre citas del mes (aprox. sin nº de huecos).
  const ocupacion = citasMes
    ? Math.round(((citasCompletadas.count ?? 0) / citasMes) * 100)
    : 0;

  // Serie de ingresos por semana (7 cubos, del más antiguo al actual).
  const serie = new Array<number>(7).fill(0);
  for (const f of facturasSerie.data ?? []) {
    const dias = Math.floor(
      (new Date(f.fecha).getTime() - inicioSerie.getTime()) / 86_400_000,
    );
    const semana = Math.min(6, Math.max(0, Math.floor(dias / 7)));
    serie[semana] += f.total_cents / 100;
  }

  return {
    ingresosMesCents,
    ingresosMesAnteriorCents: ingresosMesAnteriorCents || 1,
    citasMes,
    tasaNoShow: Math.round(tasaNoShow * 10) / 10,
    clientesNuevos: nuevos,
    clientesRecurrentes,
    ocupacion,
    serie,
  };
}

export interface CitaHoy {
  id: string;
  hora: string;
  clienteNombre: string;
  servicioNombre: string;
  estado: EstadoCita;
  color: string;
}

/** Citas de hoy del negocio, ordenadas por hora. */
export async function getCitasHoy(): Promise<CitaHoy[]> {
  if (!hasSupabase()) {
    return mockCitasHoy.map((c) => ({
      id: c.id,
      hora: c.hora,
      clienteNombre: c.clienteNombre,
      servicioNombre: c.servicioNombre,
      estado: c.estado,
      color: c.color,
    }));
  }

  const supabase = await createClient();
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);

  const { data } = await supabase
    .from('citas')
    .select('id, inicio, estado, clientes(nombre), servicios(nombre)')
    .gte('inicio', inicioDia.toISOString())
    .lt('inicio', finDia.toISOString())
    .order('inicio', { ascending: true })
    .returns<
      {
        id: string;
        inicio: string;
        estado: EstadoCita;
        clientes: { nombre: string } | null;
        servicios: { nombre: string } | null;
      }[]
    >();

  return (data ?? []).map((c) => ({
    id: c.id,
    hora: new Date(c.inicio).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    clienteNombre: c.clientes?.nombre ?? 'Cliente',
    servicioNombre: c.servicios?.nombre ?? 'Servicio',
    estado: c.estado,
    color: 'bg-brand-500',
  }));
}

export interface CitaAgenda {
  id: string;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoCita;
  clienteNombre: string;
  servicioNombre: string;
  precioCents: number;
  /** Puede marcarse como completada (no está ya facturada ni cancelada). */
  completable: boolean;
  /** Ya está facturada. */
  facturada: boolean;
}

export interface AgendaDia {
  fechaISO: string; // YYYY-MM-DD del día mostrado
  demo: boolean;
  citas: CitaAgenda[];
}

const ESTADOS_NO_COMPLETABLES: EstadoCita[] = [
  'FACTURADA',
  'CANCELADA_CLIENTE',
  'CANCELADA_NEGOCIO',
  'NO_SHOW',
];

function hhmm(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Convierte "YYYY-MM-DD" a un Date local válido, o hoy si no es válido. */
function resolverFecha(fecha?: string): Date {
  if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [y, m, d] = fecha.split('-').map(Number);
    const parsed = new Date(y, m - 1, d);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function aFechaISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Agenda de un día concreto (por defecto hoy). Devuelve las citas con la
 * información necesaria para el calendario y las acciones de completar/facturar.
 */
export async function getAgendaDia(fecha?: string): Promise<AgendaDia> {
  const dia = resolverFecha(fecha);
  const fechaISO = aFechaISO(dia);

  if (!hasSupabase()) {
    const citas: CitaAgenda[] = mockCitasHoy.map((c) => {
      const [h, m] = c.hora.split(':').map(Number);
      const finMin = h * 60 + m + 45;
      const horaFin = `${String(Math.floor(finMin / 60)).padStart(2, '0')}:${String(
        finMin % 60,
      ).padStart(2, '0')}`;
      return {
        id: c.id,
        horaInicio: c.hora,
        horaFin,
        estado: c.estado,
        clienteNombre: c.clienteNombre,
        servicioNombre: c.servicioNombre,
        precioCents: c.precioCents,
        completable: !ESTADOS_NO_COMPLETABLES.includes(c.estado),
        facturada: c.estado === 'FACTURADA',
      };
    });
    return { fechaISO, demo: true, citas };
  }

  const supabase = await createClient();
  const inicioDia = new Date(dia);
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);

  const { data } = await supabase
    .from('citas')
    .select(
      'id, inicio, fin, estado, servicios(nombre, precio_cents), clientes(nombre)',
    )
    .gte('inicio', inicioDia.toISOString())
    .lt('inicio', finDia.toISOString())
    .order('inicio', { ascending: true })
    .returns<
      {
        id: string;
        inicio: string;
        fin: string;
        estado: EstadoCita;
        servicios: { nombre: string; precio_cents: number } | null;
        clientes: { nombre: string } | null;
      }[]
    >();

  const citas: CitaAgenda[] = (data ?? []).map((c) => ({
    id: c.id,
    horaInicio: hhmm(c.inicio),
    horaFin: hhmm(c.fin),
    estado: c.estado,
    clienteNombre: c.clientes?.nombre ?? 'Cliente',
    servicioNombre: c.servicios?.nombre ?? 'Servicio',
    precioCents: c.servicios?.precio_cents ?? 0,
    completable: !ESTADOS_NO_COMPLETABLES.includes(c.estado),
    facturada: c.estado === 'FACTURADA',
  }));

  return { fechaISO, demo: false, citas };
}

export interface ResumenOnboarding {
  negocioNombre: string;
  vertical: string;
  esRestaurante: boolean;
  tieneServicios: boolean;
  tieneHorario: boolean;
  tieneCliente: boolean;
  tieneConfigRestaurante: boolean;
  /**
   * El onboarding se considera completo con al menos un servicio (verticales de
   * cita) o con la configuración de turnos guardada (restauración).
   */
  completo: boolean;
}

/**
 * Estado de configuración inicial del negocio del usuario en sesión. Devuelve
 * null en modo demo o sin sesión (el onboarding solo aplica a negocios reales).
 */
export async function getResumenOnboarding(): Promise<ResumenOnboarding | null> {
  if (!hasSupabase()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: negocio } = await supabase
    .from('negocios')
    .select('nombre, vertical, horario_json, config_restaurante_json')
    .limit(1)
    .maybeSingle<
      Pick<
        NegocioRow,
        'nombre' | 'vertical' | 'horario_json' | 'config_restaurante_json'
      >
    >();
  if (!negocio) return null;

  const [servicios, clientes] = await Promise.all([
    supabase.from('servicios').select('id', { count: 'exact', head: true }),
    supabase.from('clientes').select('id', { count: 'exact', head: true }),
  ]);

  const tieneHorario =
    !!negocio.horario_json &&
    Object.keys(negocio.horario_json as Record<string, unknown>).length > 0;
  const tieneServicios = (servicios.count ?? 0) > 0;
  const tieneCliente = (clientes.count ?? 0) > 0;

  const esRestaurante = esVerticalRestauracion(negocio.vertical);
  const configRaw = (negocio.config_restaurante_json ?? {}) as {
    turnos?: unknown[];
  };
  const tieneConfigRestaurante =
    Array.isArray(configRaw.turnos) && configRaw.turnos.length > 0;

  return {
    negocioNombre: negocio.nombre,
    vertical: negocio.vertical,
    esRestaurante,
    tieneServicios,
    tieneHorario,
    tieneCliente,
    tieneConfigRestaurante,
    completo: esRestaurante ? tieneConfigRestaurante : tieneServicios,
  };
}
