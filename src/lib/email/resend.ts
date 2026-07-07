import 'server-only';

import { appUrl } from '@/lib/env';

/**
 * Envío de email transaccional vía Resend (API REST, sin SDK).
 * Degrada con elegancia: si no hay RESEND_API_KEY, no falla; simplemente no
 * envía (útil en desarrollo). Nunca lanza para no romper el flujo de reserva.
 */

interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function enviarEmail({
  to,
  subject,
  html,
}: EmailInput): Promise<{ ok: boolean; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Klarvo <hola@klarvo.es>';

  if (!apiKey) return { ok: true, skipped: true };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/** Envoltorio HTML mínimo y sobrio para los emails de la marca. */
function plantilla(titulo: string, cuerpo: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1c1e">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e6e8eb">
        <tr><td style="padding:28px 32px 8px">
          <p style="margin:0;font-size:18px;font-weight:600;letter-spacing:-.01em">Klarvo</p>
        </td></tr>
        <tr><td style="padding:8px 32px 0">
          <h1 style="margin:0;font-size:20px;font-weight:600;letter-spacing:-.02em">${titulo}</h1>
        </td></tr>
        <tr><td style="padding:12px 32px 32px;font-size:14px;line-height:1.6;color:#4b5157">
          ${cuerpo}
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#9aa0a6">Enviado por Klarvo · Tus datos protegidos (RGPD)</p>
    </td></tr>
  </table></body></html>`;
}

/** Email de confirmación de reserva con enlace de gestión. */
export async function emailConfirmacionReserva(params: {
  to: string;
  clienteNombre: string;
  negocioNombre: string;
  servicioNombre: string;
  fechaTexto: string;
  tokenGestion: string;
}) {
  const enlace = `${appUrl()}/cita/${params.tokenGestion}`;
  const cuerpo = `
    <p style="margin:0 0 16px">Hola ${params.clienteNombre}, tu reserva en <strong>${params.negocioNombre}</strong> está confirmada.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f6f8;border-radius:12px;margin:0 0 20px">
      <tr><td style="padding:16px 18px;font-size:14px">
        <p style="margin:0 0 6px"><strong>Servicio:</strong> ${params.servicioNombre}</p>
        <p style="margin:0"><strong>Cuándo:</strong> ${params.fechaTexto}</p>
      </td></tr>
    </table>
    <a href="${enlace}" style="display:inline-block;background:#1a1c1e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:500">Gestionar mi reserva</a>
    <p style="margin:20px 0 0;font-size:13px;color:#9aa0a6">Puedes cancelar gratis hasta 24 h antes desde ese enlace.</p>`;

  return enviarEmail({
    to: params.to,
    subject: `Reserva confirmada · ${params.negocioNombre}`,
    html: plantilla('Reserva confirmada', cuerpo),
  });
}

/** Email recordatorio de una cita próxima (se envía ~24 h antes). */
export async function emailRecordatorioCita(params: {
  to: string;
  clienteNombre: string;
  negocioNombre: string;
  servicioNombre: string;
  fechaTexto: string;
  tokenGestion: string;
}) {
  const enlace = `${appUrl()}/cita/${params.tokenGestion}`;
  const cuerpo = `
    <p style="margin:0 0 16px">Hola ${params.clienteNombre}, te recordamos tu cita en <strong>${params.negocioNombre}</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f6f8;border-radius:12px;margin:0 0 20px">
      <tr><td style="padding:16px 18px;font-size:14px">
        <p style="margin:0 0 6px"><strong>Servicio:</strong> ${params.servicioNombre}</p>
        <p style="margin:0"><strong>Cuándo:</strong> ${params.fechaTexto}</p>
      </td></tr>
    </table>
    <a href="${enlace}" style="display:inline-block;background:#1a1c1e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:500">Ver o gestionar mi cita</a>
    <p style="margin:20px 0 0;font-size:13px;color:#9aa0a6">Si no puedes acudir, cancela desde ese enlace para liberar el hueco.</p>`;

  return enviarEmail({
    to: params.to,
    subject: `Recordatorio · tu cita en ${params.negocioNombre}`,
    html: plantilla('Recordatorio de tu cita', cuerpo),
  });
}
