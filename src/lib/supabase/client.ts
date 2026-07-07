import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para componentes de cliente (navegador).
 * Usa la anon key pública; el aislamiento entre negocios lo garantiza RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
