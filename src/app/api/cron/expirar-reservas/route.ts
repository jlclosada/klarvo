import { hasSupabaseAdmin } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron: libera las reservas en PENDIENTE_PAGO cuyo bloqueo (expira_en) ha
 * caducado, para no bloquear huecos indefinidamente.
 *
 * Protección: requiere la cabecera `Authorization: Bearer <CRON_SECRET>` o el
 * header `x-vercel-cron` (que Vercel añade a sus cron jobs). Programar cada
 * minuto en vercel.json o en un scheduler externo.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  const esVercelCron = request.headers.has('x-vercel-cron');

  if (secret && !esVercelCron && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, liberadas: 0, demo: true });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('expirar_reservas_pendientes');

  if (error) {
    return NextResponse.json(
      { error: 'No se pudieron expirar las reservas' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, liberadas: data ?? 0 });
}
