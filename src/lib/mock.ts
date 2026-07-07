/**
 * Datos de demostración para el panel. Permiten renderizar la app con contenido
 * realista antes de conectar Supabase. Sustituibles por consultas reales.
 */
import type { EstadoCita } from '@/lib/config';

export interface MockServicio {
  id: string;
  nombre: string;
  duracionMin: number;
  precioCents: number;
  depositoTipo: 'porcentaje' | 'fijo' | 'ninguno';
  depositoValor: number;
  activo: boolean;
}

export interface MockCliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  visitas: number;
  ultimaVisita: string;
  etiquetas: string[];
}

export interface MockCita {
  id: string;
  hora: string; // HH:mm
  clienteNombre: string;
  servicioNombre: string;
  estado: EstadoCita;
  precioCents: number;
  color: string;
}

export interface MockFactura {
  id: string;
  serie: string;
  numero: number;
  cliente: string;
  fechaISO: string;
  totalCents: number;
  estado: 'emitida' | 'pendiente';
  hash: string;
}

export const mockNegocio = {
  nombre: 'Estudio Martina',
  vertical: 'Peluquería y barbería',
  slug: 'estudio-martina',
  plan: 'Solo',
};

export const mockServicios: MockServicio[] = [
  {
    id: 's1',
    nombre: 'Corte + peinado',
    duracionMin: 45,
    precioCents: 2500,
    depositoTipo: 'porcentaje',
    depositoValor: 30,
    activo: true,
  },
  {
    id: 's2',
    nombre: 'Barba premium',
    duracionMin: 30,
    precioCents: 1500,
    depositoTipo: 'fijo',
    depositoValor: 800,
    activo: true,
  },
  {
    id: 's3',
    nombre: 'Color completo',
    duracionMin: 90,
    precioCents: 5500,
    depositoTipo: 'porcentaje',
    depositoValor: 30,
    activo: true,
  },
  {
    id: 's4',
    nombre: 'Manicura semipermanente',
    duracionMin: 60,
    precioCents: 3000,
    depositoTipo: 'ninguno',
    depositoValor: 0,
    activo: true,
  },
  {
    id: 's5',
    nombre: 'Tratamiento hidratación',
    duracionMin: 40,
    precioCents: 3500,
    depositoTipo: 'porcentaje',
    depositoValor: 20,
    activo: false,
  },
];

export const mockClientes: MockCliente[] = [
  {
    id: 'c1',
    nombre: 'Lucía Martín',
    telefono: '+34 611 22 33 44',
    email: 'lucia@email.com',
    visitas: 12,
    ultimaVisita: '2026-06-28',
    etiquetas: ['VIP', 'Color'],
  },
  {
    id: 'c2',
    nombre: 'Carlos Ruiz',
    telefono: '+34 622 33 44 55',
    email: 'carlos@email.com',
    visitas: 5,
    ultimaVisita: '2026-07-01',
    etiquetas: ['Barba'],
  },
  {
    id: 'c3',
    nombre: 'Ana García',
    telefono: '+34 633 44 55 66',
    email: 'ana@email.com',
    visitas: 8,
    ultimaVisita: '2026-06-20',
    etiquetas: ['Uñas'],
  },
  {
    id: 'c4',
    nombre: 'David López',
    telefono: '+34 644 55 66 77',
    email: 'david@email.com',
    visitas: 2,
    ultimaVisita: '2026-05-14',
    etiquetas: ['Nuevo'],
  },
  {
    id: 'c5',
    nombre: 'Marta Sanz',
    telefono: '+34 655 66 77 88',
    email: 'marta@email.com',
    visitas: 21,
    ultimaVisita: '2026-07-03',
    etiquetas: ['VIP', 'Recurrente'],
  },
];

export const mockCitasHoy: MockCita[] = [
  {
    id: 'a1',
    hora: '09:30',
    clienteNombre: 'Lucía Martín',
    servicioNombre: 'Corte + peinado',
    estado: 'CONFIRMADA',
    precioCents: 2500,
    color: 'bg-brand-500',
  },
  {
    id: 'a2',
    hora: '11:00',
    clienteNombre: 'Carlos Ruiz',
    servicioNombre: 'Barba premium',
    estado: 'CONFIRMADA',
    precioCents: 1500,
    color: 'bg-accent-500',
  },
  {
    id: 'a3',
    hora: '12:30',
    clienteNombre: 'Ana García',
    servicioNombre: 'Manicura semipermanente',
    estado: 'PENDIENTE_PAGO',
    precioCents: 3000,
    color: 'bg-amber-400',
  },
  {
    id: 'a4',
    hora: '16:00',
    clienteNombre: 'Marta Sanz',
    servicioNombre: 'Color completo',
    estado: 'CONFIRMADA',
    precioCents: 5500,
    color: 'bg-brand-500',
  },
  {
    id: 'a5',
    hora: '17:30',
    clienteNombre: 'David López',
    servicioNombre: 'Corte + peinado',
    estado: 'COMPLETADA',
    precioCents: 2500,
    color: 'bg-ink-300',
  },
];

export const mockFacturas: MockFactura[] = [
  {
    id: 'f1',
    serie: 'A',
    numero: 128,
    cliente: 'Marta Sanz',
    fechaISO: '2026-07-03',
    totalCents: 6655,
    estado: 'emitida',
    hash: '9f2a7c',
  },
  {
    id: 'f2',
    serie: 'A',
    numero: 127,
    cliente: 'Carlos Ruiz',
    fechaISO: '2026-07-01',
    totalCents: 1815,
    estado: 'emitida',
    hash: '3b81de',
  },
  {
    id: 'f3',
    serie: 'A',
    numero: 126,
    cliente: 'Lucía Martín',
    fechaISO: '2026-06-28',
    totalCents: 3025,
    estado: 'emitida',
    hash: 'c40a12',
  },
  {
    id: 'f4',
    serie: 'A',
    numero: 129,
    cliente: 'Ana García',
    fechaISO: '2026-07-05',
    totalCents: 3630,
    estado: 'pendiente',
    hash: '—',
  },
];

export const mockMetricas = {
  ingresosMesCents: 428000,
  ingresosMesAnteriorCents: 391000,
  citasMes: 96,
  tasaNoShow: 4.2,
  clientesNuevos: 14,
  clientesRecurrentes: 82,
  ocupacion: 78,
  // ingresos por semana (para gráfico)
  serie: [62, 71, 58, 84, 79, 92, 88],
};
