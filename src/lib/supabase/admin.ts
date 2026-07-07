import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase con la *service role key* (solo servidor).
 *
 * ⚠️ Salta Row Level Security. Úsalo únicamente en flujos controlados que ya
 * validan el `negocio_id` por otra vía:
 *  - Reserva pública (el cliente aún no está autenticado).
 *  - Webhooks de Stripe (no hay sesión de usuario).
 *  - Tareas de cron (expiración de reservas).
 *
 * Nunca lo importes desde componentes de cliente. `server-only` lo impide.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin no configurado (falta SUPABASE_SERVICE_ROLE_KEY).',
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
