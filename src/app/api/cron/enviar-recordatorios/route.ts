import { emailRecordatorioCita } from '@/lib/email/resend';
import { hasSupabaseAdmin } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Estados de cita que sí deben recibir recordatorio. */
const ESTADOS_ACTIVOS = ['CONFIRMADA', 'PENDIENTE_PAGO'];

interface NotificacionPendiente {
  id: string;
  cita: {
    inicio: string;
    estado: string;
    token_gestion: string;
    negocios: { nombre: string } | null;
    servicios: { nombre: string } | null;
    clientes: { nombre: string; email: string | null } | null;
  } | null;
}

/**
 * Cron: envía los recordatorios de cita cuya hora programada ya llegó.
 *
 * Recorre las notificaciones en estado `programada` con `programada_en <= now`,
 * envía el email al cliente y las marca como `enviada`. Si la cita ya no está
 * activa (cancelada, completada…) la marca como `cancelada` sin enviar.
 *
 * Protección: cabecera `Authorization: Bearer <CRON_SECRET>` o el header
 * `x-vercel-cron`. Programar cada pocos minutos en vercel.json.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  const esVercelCron = request.headers.has('x-vercel-cron');

  if (secret && !esVercelCron && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ ok: true, enviados: 0, demo: true });
  }

  const supabase = createAdminClient();
  const ahora = new Date().toISOString();

  const { data, error } = await supabase
    .from('notificaciones')
    .select(
      'id, cita:citas(inicio, estado, token_gestion, negocios(nombre), servicios(nombre), clientes(nombre, email))',
    )
    .eq('estado', 'programada')
    .eq('canal', 'email')
    .lte('programada_en', ahora)
    .limit(100)
    .returns<NotificacionPendiente[]>();

  if (error) {
    return NextResponse.json(
      { error: 'No se pudieron leer los recordatorios' },
      { status: 500 },
    );
  }

  let enviados = 0;
  let cancelados = 0;

  for (const noti of data ?? []) {
    const cita = noti.cita;

    // Cita inexistente o inactiva → cancela el recordatorio sin enviar.
    if (!cita || !ESTADOS_ACTIVOS.includes(cita.estado)) {
      await supabase
        .from('notificaciones')
        .update({ estado: 'cancelada' })
        .eq('id', noti.id);
      cancelados += 1;
      continue;
    }

    if (cita.clientes?.email) {
      await emailRecordatorioCita({
        to: cita.clientes.email,
        clienteNombre: cita.clientes.nombre,
        negocioNombre: cita.negocios?.nombre ?? 'tu cita',
        servicioNombre: cita.servicios?.nombre ?? 'Servicio',
        fechaTexto: new Date(cita.inicio).toLocaleString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        }),
        tokenGestion: cita.token_gestion,
      });
    }

    await supabase
      .from('notificaciones')
      .update({ estado: 'enviada', enviada_en: new Date().toISOString() })
      .eq('id', noti.id);
    enviados += 1;
  }

  return NextResponse.json({ ok: true, enviados, cancelados });
}
