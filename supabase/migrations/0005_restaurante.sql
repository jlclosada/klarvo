-- ============================================================================
-- Klarvo · 0005 · Reservas de restauración (mesas y comensales)
--
-- Añade soporte para negocios de hostelería, cuyas reservas se organizan por
-- turnos de comida y número de comensales (no por servicios con cita individual).
--   · Nuevo valor de vertical: 'restaurante'.
--   · negocios.config_restaurante_json: turnos, mesas por día, capacidad, etc.
--   · citas.comensales: nº de comensales de la reserva (null en el resto).
-- ============================================================================

-- Nuevo vertical. (En PG12+ ADD VALUE puede ejecutarse en transacción siempre
-- que el valor no se use en la misma transacción, como es el caso aquí.)
alter type vertical_negocio add value if not exists 'restaurante';

-- Configuración de restauración del negocio (turnos, mesas por día, aforo…).
alter table negocios
  add column if not exists config_restaurante_json jsonb not null default '{}'::jsonb;

-- Número de comensales de una reserva de restaurante. Null para el resto de
-- verticales (citas de servicios individuales).
alter table citas
  add column if not exists comensales int
  check (comensales is null or comensales > 0);
