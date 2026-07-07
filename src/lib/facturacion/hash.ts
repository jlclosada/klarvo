import { createHash } from 'crypto';

/**
 * Registro mínimo de factura para el encadenado de integridad.
 * El diseño es *append-only*: cada factura incluye el hash de la anterior,
 * formando una cadena inalterable. Esto prepara el terreno para VeriFactu
 * (integridad, conservación, trazabilidad) sin reescritura futura.
 */
export interface RegistroFactura {
  negocioId: string;
  serie: string;
  numero: number;
  fecha: string; // ISO
  nifEmisor: string;
  totalCents: number;
  baseCents: number;
  ivaCents: number;
}

/** Cadena inicial de la serie (raíz del encadenado). */
export const HASH_GENESIS = '0'.repeat(64);

/**
 * Calcula la huella (hash SHA-256) de un registro de factura encadenándolo
 * con el hash de la factura anterior. El formato de la cadena de entrada es
 * estable y determinista para poder reverificar en cualquier momento.
 */
export function calcularHashFactura(
  registro: RegistroFactura,
  hashAnterior: string,
): string {
  const payload = [
    registro.negocioId,
    registro.serie,
    registro.numero,
    registro.fecha,
    registro.nifEmisor,
    registro.baseCents,
    registro.ivaCents,
    registro.totalCents,
    hashAnterior,
  ].join('|');

  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

/**
 * Verifica la integridad de una cadena completa de facturas ordenadas por número.
 * Devuelve el índice de la primera factura corrupta, o -1 si la cadena es válida.
 */
export function verificarCadena(
  facturas: (RegistroFactura & { hashActual: string; hashAnterior: string })[],
): number {
  let esperado = HASH_GENESIS;
  for (let i = 0; i < facturas.length; i++) {
    const f = facturas[i];
    if (f.hashAnterior !== esperado) return i;
    const recalculado = calcularHashFactura(f, f.hashAnterior);
    if (recalculado !== f.hashActual) return i;
    esperado = f.hashActual;
  }
  return -1;
}

/**
 * Construye la cadena que se codificará como QR verificable (formato compatible
 * con el espíritu de VeriFactu: NIF, serie/número, fecha, total y huella).
 */
export function contenidoQrFactura(
  registro: RegistroFactura,
  hashActual: string,
): string {
  const params = new URLSearchParams({
    nif: registro.nifEmisor,
    num: `${registro.serie}/${registro.numero}`,
    fecha: registro.fecha.slice(0, 10),
    total: (registro.totalCents / 100).toFixed(2),
    hash: hashActual.slice(0, 16),
  });
  return params.toString();
}
