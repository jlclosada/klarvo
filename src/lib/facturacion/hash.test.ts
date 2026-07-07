import {
  calcularHashFactura,
  contenidoQrFactura,
  HASH_GENESIS,
  verificarCadena,
  type RegistroFactura,
} from '@/lib/facturacion/hash';
import { describe, expect, it } from 'vitest';

const base: RegistroFactura = {
  negocioId: 'neg-1',
  serie: 'A',
  numero: 1,
  fecha: '2027-01-15T10:00:00.000Z',
  nifEmisor: '12345678Z',
  baseCents: 2066,
  ivaCents: 434,
  totalCents: 2500,
};

describe('encadenado de facturas (VeriFactu-ready)', () => {
  it('produce un hash determinista', () => {
    const h1 = calcularHashFactura(base, HASH_GENESIS);
    const h2 = calcularHashFactura(base, HASH_GENESIS);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it('cambia el hash si cambia cualquier dato', () => {
    const h1 = calcularHashFactura(base, HASH_GENESIS);
    const h2 = calcularHashFactura({ ...base, totalCents: 2501 }, HASH_GENESIS);
    expect(h1).not.toBe(h2);
  });

  it('verifica una cadena íntegra', () => {
    const f1 = { ...base, numero: 1 };
    const h1 = calcularHashFactura(f1, HASH_GENESIS);
    const f2 = { ...base, numero: 2, totalCents: 1815 };
    const h2 = calcularHashFactura(f2, h1);

    const cadena = [
      { ...f1, hashAnterior: HASH_GENESIS, hashActual: h1 },
      { ...f2, hashAnterior: h1, hashActual: h2 },
    ];
    expect(verificarCadena(cadena)).toBe(-1);
  });

  it('detecta manipulación en la cadena', () => {
    const f1 = { ...base, numero: 1 };
    const h1 = calcularHashFactura(f1, HASH_GENESIS);
    const f2 = { ...base, numero: 2 };
    const h2 = calcularHashFactura(f2, h1);

    // Se altera el total de la primera factura sin recalcular su hash.
    const cadena = [
      { ...f1, totalCents: 9999, hashAnterior: HASH_GENESIS, hashActual: h1 },
      { ...f2, hashAnterior: h1, hashActual: h2 },
    ];
    expect(verificarCadena(cadena)).toBe(0);
  });

  it('genera contenido QR con los campos clave', () => {
    const h1 = calcularHashFactura(base, HASH_GENESIS);
    const qr = contenidoQrFactura(base, h1);
    expect(qr).toContain('nif=12345678Z');
    expect(qr).toContain('total=25.00');
  });
});
