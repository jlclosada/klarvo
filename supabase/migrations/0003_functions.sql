-- ============================================================================
-- Klarvo · 0003 · Funciones y triggers
-- Numeración correlativa de facturas y provisión de negocio al registrarse.
-- ============================================================================

-- ── Numeración de facturas: correlativa y a prueba de concurrencia ───────────
-- Bloquea las facturas del negocio+serie para asignar el siguiente número sin
-- huecos ni duplicados (requisito de trazabilidad de VeriFactu).
create or replace function siguiente_numero_factura(p_negocio uuid, p_serie text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num int;
begin
  perform pg_advisory_xact_lock(hashtext(p_negocio::text || p_serie));
  select coalesce(max(numero), 0) + 1 into v_num
  from facturas
  where negocio_id = p_negocio and serie = p_serie;
  return v_num;
end;
$$;

-- ── Provisión automática de negocio al confirmarse el usuario ────────────────
-- Crea el negocio, el miembro (propietario) y el profesional inicial usando los
-- metadatos capturados en el registro (negocio_nombre, negocio_slug, vertical).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_negocio uuid;
  v_slug text;
  v_nombre text;
  v_vertical vertical_negocio;
begin
  v_nombre := coalesce(new.raw_user_meta_data ->> 'negocio_nombre', 'Mi negocio');
  v_slug   := coalesce(new.raw_user_meta_data ->> 'negocio_slug', 'negocio-' || substr(new.id::text, 1, 8));
  begin
    v_vertical := (new.raw_user_meta_data ->> 'vertical')::vertical_negocio;
  exception when others then
    v_vertical := 'peluqueria';
  end;

  -- Garantiza unicidad del slug.
  if exists (select 1 from negocios where slug = v_slug) then
    v_slug := v_slug || '-' || substr(new.id::text, 1, 6);
  end if;

  insert into negocios (nombre, slug, vertical)
  values (v_nombre, v_slug, v_vertical)
  returning id into v_negocio;

  insert into miembros (user_id, negocio_id, rol)
  values (new.id, v_negocio, 'propietario');

  insert into profesionales (negocio_id, user_id, nombre, rol)
  values (v_negocio, new.id, v_nombre, 'propietario');

  return new;
end;
$$;

-- Se dispara cuando Supabase Auth crea un usuario nuevo.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Limpieza de reservas caducadas (llamar desde cron cada minuto) ───────────
-- Libera huecos de citas que quedaron en PENDIENTE_PAGO y expiraron.
create or replace function expirar_reservas_pendientes()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_afectadas int;
begin
  update citas
  set estado = 'CANCELADA_NEGOCIO'
  where estado = 'PENDIENTE_PAGO'
    and expira_en is not null
    and expira_en < now();
  get diagnostics v_afectadas = row_count;
  return v_afectadas;
end;
$$;
