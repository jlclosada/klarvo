'use server';

import { hasSupabaseAdmin } from '@/lib/env';
import {
  HASH_GENESIS,
  calcularHashFactura,
  contenidoQrFactura,
  type RegistroFactura,
} from '@/lib/facturacion/hash';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { CitaRow, FacturaRow, ServicioRow } from '@/lib/supabase/types';
import { revalidatePath } from 'next/cache';

/** IVA general aplicado por defecto (21%). Configurable por negocio en fase 2. */
const IVA_PORCENTAJE = 21;
const SERIE_DEFECTO = 'A';

export interface ResultadoFactura {
  ok: boolean;
  error?: string;
  facturaId?: string;
  numero?: number;
}

/**
 * Emite la factura de una cita completada, encadenándola (SHA-256) con la
 * anterior de la serie del negocio. Diseño *append-only*: nunca se modifica ni
 * elimina una factura (integridad tipo VeriFactu).
 *
 * Requiere sesión: el usuario debe ser miembro del negocio (lo garantiza RLS
 * al leer la cita a través del cliente autenticado).
 */
export async function emitirFacturaDeCita(
  citaId: string,
): Promise<ResultadoFactura> {
  if (!hasSupabaseAdmin()) {
    return { ok: false, error: 'Facturación no disponible en modo demo.' };
  }

  // Cliente autenticado → valida pertenencia al negocio vía RLS.
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado.' };

  const { data: cita } = await auth
    .from('citas')
    .select('*')
    .eq('id', citaId)
    .maybeSingle<CitaRow>();

  if (!cita) return { ok: false, error: 'Cita no encontrada.' };
  if (cita.estado === 'FACTURADA') {
    return { ok: false, error: 'Esta cita ya está facturada.' };
  }
  if (cita.estado !== 'COMPLETADA') {
    return { ok: false, error: 'Solo se factura una cita completada.' };
  }

  const { data: servicio } = await auth
    .from('servicios')
    .select('*')
    .eq('id', cita.servicio_id ?? '')
    .maybeSingle<ServicioRow>();

  const totalCents = servicio?.precio_cents ?? 0;
  // Precio con IVA incluido → desglose base + IVA.
  const baseCents = Math.round((totalCents * 100) / (100 + IVA_PORCENTAJE));
  const ivaCents = totalCents - baseCents;

  // A partir de aquí, operaciones críticas con el cliente admin (numeración +
  // encadenado atómico). El negocio ya está validado por la lectura anterior.
  const admin = createAdminClient();

  const { data: nif } = await admin
    .from('negocios')
    .select('datos_fiscales_json')
    .eq('id', cita.negocio_id)
    .maybeSingle<{ datos_fiscales_json: { nif?: string } }>();
  const nifEmisor = nif?.datos_fiscales_json?.nif ?? '';

  // Número correlativo a prueba de concurrencia (advisory lock en la función).
  const { data: numero, error: errNum } = await admin.rpc(
    'siguiente_numero_factura',
    { p_negocio: cita.negocio_id, p_serie: SERIE_DEFECTO },
  );
  if (errNum || typeof numero !== 'number') {
    return { ok: false, error: 'No se pudo asignar el número de factura.' };
  }

  // Hash de la factura inmediatamente anterior de la serie.
  const { data: anterior } = await admin
    .from('facturas')
    .select('hash_actual')
    .eq('negocio_id', cita.negocio_id)
    .eq('serie', SERIE_DEFECTO)
    .order('numero', { ascending: false })
    .limit(1)
    .maybeSingle<{ hash_actual: string }>();

  const hashAnterior = anterior?.hash_actual ?? HASH_GENESIS;
  const fecha = new Date().toISOString();

  const registro: RegistroFactura = {
    negocioId: cita.negocio_id,
    serie: SERIE_DEFECTO,
    numero,
    fecha,
    nifEmisor,
    totalCents,
    baseCents,
    ivaCents,
  };
  const hashActual = calcularHashFactura(registro, hashAnterior);
  const qr = contenidoQrFactura(registro, hashActual);

  const { data: factura, error: errFactura } = await admin
    .from('facturas')
    .insert({
      negocio_id: cita.negocio_id,
      cita_id: cita.id,
      serie: SERIE_DEFECTO,
      numero,
      fecha,
      base_cents: baseCents,
      iva_cents: ivaCents,
      total_cents: totalCents,
      nif_emisor: nifEmisor || null,
      hash_anterior: hashAnterior,
      hash_actual: hashActual,
      qr,
    })
    .select('id, numero')
    .single<Pick<FacturaRow, 'id' | 'numero'>>();

  if (errFactura || !factura) {
    return { ok: false, error: 'No se pudo emitir la factura.' };
  }

  await admin.from('citas').update({ estado: 'FACTURADA' }).eq('id', cita.id);

  revalidatePath('/app/facturacion');
  return { ok: true, facturaId: factura.id, numero: factura.numero };
}
