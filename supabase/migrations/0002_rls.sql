-- ============================================================================
-- Klarvo · 0002 · Row Level Security (aislamiento multi-tenant)
-- Cada negocio solo puede ver y modificar sus propios datos.
-- ============================================================================

-- Función auxiliar: ¿pertenece el usuario actual a este negocio?
create or replace function es_miembro(negocio uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from miembros m
    where m.negocio_id = negocio
      and m.user_id = auth.uid()
  );
$$;

-- Activar RLS en todas las tablas con datos de negocio.
alter table negocios        enable row level security;
alter table miembros        enable row level security;
alter table profesionales   enable row level security;
alter table servicios       enable row level security;
alter table clientes        enable row level security;
alter table citas           enable row level security;
alter table facturas        enable row level security;
alter table bonos           enable row level security;
alter table notificaciones  enable row level security;
alter table suscripciones   enable row level security;
alter table auditoria       enable row level security;

-- ─────────────────────────────── Negocios ───────────────────────────────────
create policy negocios_select on negocios for select
  using (es_miembro(id));
create policy negocios_update on negocios for update
  using (es_miembro(id));

-- ─────────────────────────────── Miembros ───────────────────────────────────
create policy miembros_select on miembros for select
  using (user_id = auth.uid() or es_miembro(negocio_id));

-- ─── Plantilla de política por tabla con columna negocio_id ──────────────────
-- (select/insert/update/delete restringidos a miembros del negocio)

create policy profesionales_all on profesionales for all
  using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));

create policy servicios_all on servicios for all
  using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));

create policy clientes_all on clientes for all
  using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));

create policy citas_all on citas for all
  using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));

-- Facturas: lectura e inserción por miembros. NO update/delete (append-only).
create policy facturas_select on facturas for select
  using (es_miembro(negocio_id));
create policy facturas_insert on facturas for insert
  with check (es_miembro(negocio_id));

create policy bonos_all on bonos for all
  using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));

create policy notificaciones_all on notificaciones for all
  using (es_miembro(negocio_id)) with check (es_miembro(negocio_id));

create policy suscripciones_select on suscripciones for select
  using (es_miembro(negocio_id));

create policy auditoria_select on auditoria for select
  using (es_miembro(negocio_id));

-- Nota: las reservas públicas (cliente final sin sesión) y los webhooks de
-- Stripe se realizan con la service role key desde el servidor, que omite RLS.
-- Toda escritura pública debe validarse en el backend antes de insertar.
