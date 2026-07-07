-- ============================================================================
-- Klarvo · 0004 · Privilegios de la Data API (PostgREST)
--
-- Las versiones actuales de Supabase/Postgres NO conceden automáticamente
-- privilegios a los roles de la API (`anon`, `authenticated`, `service_role`)
-- sobre las tablas nuevas del esquema public. Sin estos GRANT, PostgREST
-- devuelve "permission denied for table ..." aunque existan políticas RLS.
--
-- La seguridad multi-tenant la sigue garantizando Row Level Security: estos
-- privilegios solo abren el acceso a nivel de tabla; las políticas de 0002_rls
-- restringen las FILAS visibles a cada negocio.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

-- Usuarios autenticados: acceso completo (RLS filtra por negocio).
grant select, insert, update, delete
  on all tables in schema public to authenticated;

-- Rol de servicio (backend / admin): omite RLS y opera sobre todo.
grant select, insert, update, delete
  on all tables in schema public to service_role;

grant usage, select on all sequences in schema public
  to authenticated, service_role;

grant execute on all routines in schema public
  to anon, authenticated, service_role;

-- Privilegios por defecto para objetos futuros creados por el rol postgres.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema public
  grant execute on routines to anon, authenticated, service_role;
