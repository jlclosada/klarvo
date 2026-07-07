import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente de Supabase para Server Components, Route Handlers y Server Actions.
 * Gestiona la sesión mediante cookies. El aislamiento entre negocios (multi-tenant)
 * lo garantiza Row Level Security en Postgres.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: object;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...(options ?? {}) }),
            );
          } catch {
            // Llamado desde un Server Component: se puede ignorar si hay
            // middleware refrescando la sesión.
          }
        },
      },
    },
  );
}
