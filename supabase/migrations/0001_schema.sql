-- ============================================================================
-- Klarvo · 0001 · Esquema base (multi-tenant)
-- Postgres / Supabase. Aislamiento entre negocios mediante Row Level Security.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─────────────────────────────── Enums ──────────────────────────────────────
create type vertical_negocio as enum (
  'peluqueria', 'estetica', 'masaje', 'fisio', 'fitness', 'bienestar'
);

create type estado_cita as enum (
  'BORRADOR', 'PENDIENTE_PAGO', 'CONFIRMADA', 'RECORDADA',
  'COMPLETADA', 'FACTURADA', 'CANCELADA_CLIENTE', 'CANCELADA_NEGOCIO', 'NO_SHOW'
);

create type tipo_deposito as enum ('ninguno', 'fijo', 'porcentaje');
create type rol_profesional as enum ('propietario', 'empleado');
create type canal_notificacion as enum ('email', 'sms', 'whatsapp');
create type estado_suscripcion as enum ('prueba', 'activa', 'pausada', 'cancelada', 'impago');

-- ────────────────────────────── Negocios ────────────────────────────────────
create table negocios (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  slug              text not null unique,
  vertical          vertical_negocio not null default 'peluqueria',
  horario_json      jsonb not null default '{}'::jsonb,
  plan              text not null default 'solo',
  estado_suscripcion estado_suscripcion not null default 'prueba',
  stripe_customer_id text,
  stripe_account_id  text,
  datos_fiscales_json jsonb not null default '{}'::jsonb,
  region_datos      text not null default 'eu',
  creado_en         timestamptz not null default now()
);

-- Vincula usuarios de Supabase Auth con su negocio y rol.
create table miembros (
  user_id     uuid not null references auth.users(id) on delete cascade,
  negocio_id  uuid not null references negocios(id) on delete cascade,
  rol         rol_profesional not null default 'propietario',
  creado_en   timestamptz not null default now(),
  primary key (user_id, negocio_id)
);

-- ──────────────────────────── Profesionales ─────────────────────────────────
create table profesionales (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references negocios(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  nombre      text not null,
  color       text not null default '#3366ff',
  rol         rol_profesional not null default 'empleado',
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index on profesionales (negocio_id);

-- ────────────────────────────── Servicios ───────────────────────────────────
create table servicios (
  id             uuid primary key default gen_random_uuid(),
  negocio_id     uuid not null references negocios(id) on delete cascade,
  nombre         text not null,
  duracion_min   int not null check (duracion_min > 0),
  buffer_min     int not null default 0 check (buffer_min >= 0),
  precio_cents   int not null check (precio_cents >= 0),
  deposito_tipo  tipo_deposito not null default 'ninguno',
  deposito_valor int not null default 0 check (deposito_valor >= 0),
  activo         boolean not null default true,
  creado_en      timestamptz not null default now()
);
create index on servicios (negocio_id);

-- ─────────────────────────────── Clientes ───────────────────────────────────
create table clientes (
  id                   uuid primary key default gen_random_uuid(),
  negocio_id           uuid not null references negocios(id) on delete cascade,
  nombre               text not null,
  telefono             text,
  email                text,
  notas                text,
  consentimiento_rgpd  boolean not null default false,
  consentimiento_fecha timestamptz,
  etiquetas            text[] not null default '{}',
  creado_en            timestamptz not null default now()
);
create index on clientes (negocio_id);
create index on clientes (negocio_id, email);

-- ─────────────────────────────────── Citas ──────────────────────────────────
create table citas (
  id                       uuid primary key default gen_random_uuid(),
  negocio_id               uuid not null references negocios(id) on delete cascade,
  cliente_id               uuid references clientes(id) on delete set null,
  servicio_id              uuid references servicios(id) on delete set null,
  profesional_id           uuid references profesionales(id) on delete set null,
  inicio                   timestamptz not null,
  fin                      timestamptz not null,
  estado                   estado_cita not null default 'BORRADOR',
  deposito_importe_cents   int not null default 0 check (deposito_importe_cents >= 0),
  deposito_pagado          boolean not null default false,
  stripe_payment_intent_id text,
  token_gestion            uuid not null default gen_random_uuid(),
  expira_en                timestamptz,
  creada_en                timestamptz not null default now(),
  constraint fin_posterior check (fin > inicio)
);
create index on citas (negocio_id, inicio);
create index on citas (profesional_id, inicio);
create unique index on citas (token_gestion);

-- ─────────────────────────────── Facturas ───────────────────────────────────
-- Diseño append-only encadenado (integridad tipo VeriFactu).
create table facturas (
  id             uuid primary key default gen_random_uuid(),
  negocio_id     uuid not null references negocios(id) on delete cascade,
  cita_id        uuid references citas(id) on delete set null,
  serie          text not null default 'A',
  numero         int not null,
  fecha          timestamptz not null default now(),
  base_cents     int not null,
  iva_cents      int not null,
  total_cents    int not null,
  nif_emisor     text,
  hash_anterior  text not null,
  hash_actual    text not null,
  qr             text,
  estado_aeat    text not null default 'no_enviada',
  verifactu_json jsonb,
  creado_en      timestamptz not null default now(),
  unique (negocio_id, serie, numero)
);
create index on facturas (negocio_id, fecha);

-- ──────────────────────────────── Bonos ─────────────────────────────────────
create table bonos (
  id             uuid primary key default gen_random_uuid(),
  negocio_id     uuid not null references negocios(id) on delete cascade,
  cliente_id     uuid not null references clientes(id) on delete cascade,
  servicio_id    uuid references servicios(id) on delete set null,
  sesiones_total int not null check (sesiones_total > 0),
  sesiones_usadas int not null default 0 check (sesiones_usadas >= 0),
  caduca_en      timestamptz,
  creado_en      timestamptz not null default now()
);
create index on bonos (negocio_id, cliente_id);

-- ──────────────────────────── Notificaciones ────────────────────────────────
create table notificaciones (
  id            uuid primary key default gen_random_uuid(),
  negocio_id    uuid not null references negocios(id) on delete cascade,
  cita_id       uuid references citas(id) on delete cascade,
  canal         canal_notificacion not null default 'email',
  estado        text not null default 'programada',
  programada_en timestamptz not null,
  enviada_en    timestamptz
);
create index on notificaciones (estado, programada_en);

-- ───────────────────────────── Suscripciones ────────────────────────────────
create table suscripciones (
  id                     uuid primary key default gen_random_uuid(),
  negocio_id             uuid not null references negocios(id) on delete cascade,
  plan                   text not null,
  stripe_subscription_id text,
  estado                 estado_suscripcion not null default 'prueba',
  periodo_fin            timestamptz
);
create index on suscripciones (negocio_id);

-- ───────────────────── Idempotencia de webhooks Stripe ──────────────────────
create table eventos_stripe (
  event_id     text primary key,
  tipo         text not null,
  procesado_en timestamptz not null default now()
);

-- ─────────────────────────────── Auditoría ──────────────────────────────────
create table auditoria (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid references negocios(id) on delete set null,
  actor       uuid references auth.users(id) on delete set null,
  accion      text not null,
  entidad     text not null,
  entidad_id  uuid,
  ts          timestamptz not null default now(),
  ip          inet
);
create index on auditoria (negocio_id, ts);
