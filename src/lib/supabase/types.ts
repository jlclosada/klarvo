/**
 * Tipos del esquema de base de datos (Postgres/Supabase).
 * Reflejan las migraciones de `supabase/migrations/*`. Sirven para tipar los
 * clientes de Supabase y las consultas de dominio.
 */

export type VerticalNegocio =
  | 'peluqueria'
  | 'estetica'
  | 'masaje'
  | 'fisio'
  | 'fitness'
  | 'bienestar';

export type EstadoCitaDB =
  | 'BORRADOR'
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADA'
  | 'RECORDADA'
  | 'COMPLETADA'
  | 'FACTURADA'
  | 'CANCELADA_CLIENTE'
  | 'CANCELADA_NEGOCIO'
  | 'NO_SHOW';

export type TipoDeposito = 'ninguno' | 'fijo' | 'porcentaje';
export type RolProfesional = 'propietario' | 'empleado';
export type EstadoSuscripcion =
  | 'prueba'
  | 'activa'
  | 'pausada'
  | 'cancelada'
  | 'impago';

export interface NegocioRow {
  id: string;
  nombre: string;
  slug: string;
  vertical: VerticalNegocio;
  horario_json: Record<string, unknown>;
  plan: string;
  estado_suscripcion: EstadoSuscripcion;
  stripe_customer_id: string | null;
  stripe_account_id: string | null;
  datos_fiscales_json: Record<string, unknown>;
  region_datos: string;
  creado_en: string;
}

export interface ServicioRow {
  id: string;
  negocio_id: string;
  nombre: string;
  duracion_min: number;
  buffer_min: number;
  precio_cents: number;
  deposito_tipo: TipoDeposito;
  deposito_valor: number;
  activo: boolean;
  creado_en: string;
}

export interface ClienteRow {
  id: string;
  negocio_id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  consentimiento_rgpd: boolean;
  consentimiento_fecha: string | null;
  etiquetas: string[];
  creado_en: string;
}

export interface ProfesionalRow {
  id: string;
  negocio_id: string;
  user_id: string | null;
  nombre: string;
  color: string;
  rol: RolProfesional;
  activo: boolean;
  creado_en: string;
}

export interface CitaRow {
  id: string;
  negocio_id: string;
  cliente_id: string | null;
  servicio_id: string | null;
  profesional_id: string | null;
  inicio: string;
  fin: string;
  estado: EstadoCitaDB;
  deposito_importe_cents: number;
  deposito_pagado: boolean;
  stripe_payment_intent_id: string | null;
  token_gestion: string;
  expira_en: string | null;
  creada_en: string;
}

export interface FacturaRow {
  id: string;
  negocio_id: string;
  cita_id: string | null;
  serie: string;
  numero: number;
  fecha: string;
  base_cents: number;
  iva_cents: number;
  total_cents: number;
  nif_emisor: string | null;
  hash_anterior: string;
  hash_actual: string;
  qr: string | null;
  estado_aeat: string;
  verifactu_json: Record<string, unknown> | null;
  creado_en: string;
}
