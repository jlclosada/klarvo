/**
 * Configuración central del producto: marca, navegación, planes y verticales.
 * Fuente única de verdad para landing, precios y onboarding.
 */

export const site = {
  name: 'Klarvo',
  tagline:
    'Gestiona tu agenda, cobra depósitos y no pierdas ni un cliente ni una factura.',
  description:
    'Reservas online, gestión de clientes y facturación para profesionales de belleza, estética y bienestar. Listo para VeriFactu 2027.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://klarvo.es',
  email: 'hola@klarvo.es',
} as const;

export const nav = {
  main: [
    { label: 'Características', href: '/caracteristicas' },
    { label: 'Precios', href: '/precios' },
    { label: 'VeriFactu 2027', href: '/verifactu' },
  ],
  legal: [
    { label: 'Privacidad', href: '/legal/privacidad' },
    { label: 'Términos', href: '/legal/terminos' },
    { label: 'Cookies', href: '/legal/cookies' },
    { label: 'Encargado de tratamiento (DPA)', href: '/legal/dpa' },
  ],
} as const;

export type Vertical = {
  id: string;
  nombre: string;
  emoji: string;
};

export const verticales: Vertical[] = [
  { id: 'peluqueria', nombre: 'Peluquería y barbería', emoji: '✂️' },
  { id: 'estetica', nombre: 'Estética y uñas', emoji: '💅' },
  { id: 'masaje', nombre: 'Masaje y spa', emoji: '💆' },
  { id: 'fisio', nombre: 'Fisioterapia', emoji: '🧑‍⚕️' },
  { id: 'fitness', nombre: 'Entrenamiento personal', emoji: '🏋️' },
  { id: 'bienestar', nombre: 'Psicología y nutrición', emoji: '🧠' },
  { id: 'restaurante', nombre: 'Restaurante y hostelería', emoji: '🍽️' },
];

/**
 * Verticales cuyas reservas funcionan por mesas y comensales (turnos de comida)
 * en lugar de por servicios con cita individual.
 */
export const VERTICALES_RESTAURACION = ['restaurante'] as const;

/** Indica si un vertical usa el modelo de reservas de restauración (mesas). */
export function esVerticalRestauracion(vertical: string): boolean {
  return (VERTICALES_RESTAURACION as readonly string[]).includes(vertical);
}

/**
 * Nombre legible de un vertical a partir de su id. Si no se encuentra (p. ej.
 * en modo demo el valor ya es el nombre), devuelve el valor recibido tal cual.
 */
export function nombreVertical(vertical: string): string {
  return verticales.find((v) => v.id === vertical)?.nombre ?? vertical;
}

export type Plan = {
  id: 'solo' | 'equipo' | 'centro';
  nombre: string;
  precioMes: number;
  precioAnioMes: number;
  destacado?: boolean;
  claim: string;
  incluye: string[];
  limite: string;
};

export const planes: Plan[] = [
  {
    id: 'solo',
    nombre: 'Solo',
    precioMes: 24,
    precioAnioMes: 19,
    claim: 'Para el profesional independiente.',
    limite: '1 profesional',
    incluye: [
      'Reservas online ilimitadas',
      'Página pública de reservas',
      'Cobro de depósitos (Stripe)',
      'Recordatorios por email',
      'Ficha de cliente e historial',
      'Facturación simplificada',
      'Métricas de negocio',
    ],
  },
  {
    id: 'equipo',
    nombre: 'Equipo',
    precioMes: 59,
    precioAnioMes: 49,
    destacado: true,
    claim: 'Para centros con varios profesionales.',
    limite: 'Hasta 5 profesionales',
    incluye: [
      'Todo lo de Solo',
      'Recordatorios por WhatsApp y SMS',
      'Bonos y paquetes de sesiones',
      'Agenda por profesional',
      'Programa de fidelización',
      'Roles y permisos de equipo',
    ],
  },
  {
    id: 'centro',
    nombre: 'Centro',
    precioMes: 129,
    precioAnioMes: 109,
    claim: 'Para multi-sede y franquicias.',
    limite: 'Profesionales ilimitados',
    incluye: [
      'Todo lo de Equipo',
      'Multi-sede',
      'Marca blanca parcial',
      'Analítica avanzada',
      'Soporte prioritario',
      'API y webhooks',
    ],
  },
];

/** Estados posibles de una cita (máquina de estados). */
export const ESTADOS_CITA = [
  'BORRADOR',
  'PENDIENTE_PAGO',
  'CONFIRMADA',
  'RECORDADA',
  'COMPLETADA',
  'FACTURADA',
  'CANCELADA_CLIENTE',
  'CANCELADA_NEGOCIO',
  'NO_SHOW',
] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];
