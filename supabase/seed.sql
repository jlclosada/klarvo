-- ============================================================================
-- Klarvo · Datos de demostración para el entorno LOCAL
-- Se cargan automáticamente al ejecutar `supabase db reset`.
--
-- Crea un usuario de acceso ya confirmado:
--     email:    demo@klarvo.local
--     password: demo1234
--
-- Al insertarse el usuario, el trigger handle_new_user() provisiona el negocio
-- "Estudio Martina", su miembro propietario y el profesional inicial.
-- Después rellenamos servicios, clientes y citas de hoy sobre ese negocio.
-- ============================================================================

-- ── Usuario demo (confirmado) ────────────────────────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'demo@klarvo.local',
  crypt('demo1234', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"negocio_nombre":"Estudio Martina","negocio_slug":"estudio-martina","vertical":"peluqueria"}',
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

-- Identidad de email asociada (necesaria para el inicio de sesión).
insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@klarvo.local"}',
  'email',
  '11111111-1111-1111-1111-111111111111',
  now(), now(), now()
)
on conflict do nothing;

-- ── Servicios, clientes y citas del negocio demo ─────────────────────────────
do $$
declare
  v_user     uuid := '11111111-1111-1111-1111-111111111111';
  v_negocio  uuid;
  v_prof     uuid;
  v_s1 uuid; v_s2 uuid; v_s3 uuid; v_s4 uuid; v_s5 uuid;
  v_c1 uuid; v_c2 uuid; v_c3 uuid; v_c4 uuid; v_c5 uuid;
begin
  select negocio_id into v_negocio from miembros where user_id = v_user limit 1;
  if v_negocio is null then
    raise notice 'No se encontró negocio para el usuario demo; ¿se ejecutó el trigger?';
    return;
  end if;

  select id into v_prof from profesionales where negocio_id = v_negocio limit 1;

  -- Horario de apertura (Lun-Vie 09:00-19:00, Sáb 09:00-14:00).
  update negocios
  set horario_json = '{
        "lun": [["09:00","19:00"]],
        "mar": [["09:00","19:00"]],
        "mie": [["09:00","19:00"]],
        "jue": [["09:00","19:00"]],
        "vie": [["09:00","19:00"]],
        "sab": [["09:00","14:00"]],
        "dom": []
      }'::jsonb
  where id = v_negocio;

  -- Servicios (coinciden con los datos de demostración de la app).
  insert into servicios (negocio_id, nombre, duracion_min, precio_cents, deposito_tipo, deposito_valor, activo)
    values (v_negocio, 'Corte + peinado', 45, 2500, 'porcentaje', 30, true) returning id into v_s1;
  insert into servicios (negocio_id, nombre, duracion_min, precio_cents, deposito_tipo, deposito_valor, activo)
    values (v_negocio, 'Barba premium', 30, 1500, 'fijo', 800, true) returning id into v_s2;
  insert into servicios (negocio_id, nombre, duracion_min, precio_cents, deposito_tipo, deposito_valor, activo)
    values (v_negocio, 'Color completo', 90, 5500, 'porcentaje', 30, true) returning id into v_s3;
  insert into servicios (negocio_id, nombre, duracion_min, precio_cents, deposito_tipo, deposito_valor, activo)
    values (v_negocio, 'Manicura semipermanente', 60, 3000, 'ninguno', 0, true) returning id into v_s4;
  insert into servicios (negocio_id, nombre, duracion_min, precio_cents, deposito_tipo, deposito_valor, activo)
    values (v_negocio, 'Tratamiento hidratación', 40, 3500, 'porcentaje', 20, false) returning id into v_s5;

  -- Clientes.
  insert into clientes (negocio_id, nombre, telefono, email, consentimiento_rgpd, consentimiento_fecha, etiquetas)
    values (v_negocio, 'Lucía Martín', '+34 611 22 33 44', 'lucia@email.com', true, now(), '{VIP,Color}') returning id into v_c1;
  insert into clientes (negocio_id, nombre, telefono, email, consentimiento_rgpd, consentimiento_fecha, etiquetas)
    values (v_negocio, 'Carlos Ruiz', '+34 622 33 44 55', 'carlos@email.com', true, now(), '{Barba}') returning id into v_c2;
  insert into clientes (negocio_id, nombre, telefono, email, consentimiento_rgpd, consentimiento_fecha, etiquetas)
    values (v_negocio, 'Ana García', '+34 633 44 55 66', 'ana@email.com', true, now(), '{Uñas}') returning id into v_c3;
  insert into clientes (negocio_id, nombre, telefono, email, consentimiento_rgpd, consentimiento_fecha, etiquetas)
    values (v_negocio, 'David López', '+34 644 55 66 77', 'david@email.com', false, null, '{Nuevo}') returning id into v_c4;
  insert into clientes (negocio_id, nombre, telefono, email, consentimiento_rgpd, consentimiento_fecha, etiquetas)
    values (v_negocio, 'Marta Sanz', '+34 655 66 77 88', 'marta@email.com', true, now(), '{VIP,Recurrente}') returning id into v_c5;

  -- Citas de HOY (usan la fecha actual para que aparezcan en el calendario).
  insert into citas (negocio_id, cliente_id, servicio_id, profesional_id, inicio, fin, estado, deposito_importe_cents, deposito_pagado)
    values (v_negocio, v_c1, v_s1, v_prof,
            (current_date + time '09:30'), (current_date + time '10:15'),
            'CONFIRMADA', 750, true);
  insert into citas (negocio_id, cliente_id, servicio_id, profesional_id, inicio, fin, estado, deposito_importe_cents, deposito_pagado)
    values (v_negocio, v_c2, v_s2, v_prof,
            (current_date + time '11:00'), (current_date + time '11:30'),
            'CONFIRMADA', 800, true);
  insert into citas (negocio_id, cliente_id, servicio_id, profesional_id, inicio, fin, estado, deposito_importe_cents, deposito_pagado, expira_en)
    values (v_negocio, v_c3, v_s4, v_prof,
            (current_date + time '12:30'), (current_date + time '13:30'),
            'PENDIENTE_PAGO', 0, false, now() + interval '15 minutes');
  insert into citas (negocio_id, cliente_id, servicio_id, profesional_id, inicio, fin, estado, deposito_importe_cents, deposito_pagado)
    values (v_negocio, v_c5, v_s3, v_prof,
            (current_date + time '16:00'), (current_date + time '17:30'),
            'CONFIRMADA', 1650, true);
  insert into citas (negocio_id, cliente_id, servicio_id, profesional_id, inicio, fin, estado, deposito_importe_cents, deposito_pagado)
    values (v_negocio, v_c4, v_s1, v_prof,
            (current_date + time '17:30'), (current_date + time '18:15'),
            'COMPLETADA', 750, true);

  raise notice 'Seed Klarvo cargado en negocio %', v_negocio;
end $$;
