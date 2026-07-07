import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sesión: refresca la cookie de Supabase y protege /app.
 * Si Supabase aún no está configurado (sin variables de entorno), deja pasar
 * para no romper el desarrollo local del frontend.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = NextResponse.next({ request });

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: object;
        }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isApp = request.nextUrl.pathname.startsWith('/app');
  const isAuth =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/registro';

  // Sin sesión intentando entrar al panel → login
  if (isApp && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/login';
    return NextResponse.redirect(redirect);
  }

  // Con sesión en páginas de auth → panel
  if (isAuth && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/app';
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/login', '/registro'],
};
