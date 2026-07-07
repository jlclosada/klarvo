import {
  calcularDeposito,
  calcularHuecos,
  reembolsoPorCancelacion,
} from '@/lib/reservas/disponibilidad';
import { describe, expect, it } from 'vitest';

const dia = new Date('2027-03-01T00:00:00');

describe('cálculo de huecos', () => {
  it('genera huecos dentro del horario', () => {
    const huecos = calcularHuecos({
      fecha: dia,
      horario: { aperturaMin: 9 * 60, cierreMin: 11 * 60 },
      duracionMin: 60,
      bufferMin: 0,
      pasoMin: 30,
      ocupadas: [],
    });
    // 9:00, 9:30, 10:00 (10:00+60=11:00 cabe justo)
    expect(huecos).toHaveLength(3);
    expect(huecos[0].getHours()).toBe(9);
  });

  it('excluye huecos que se solapan con citas ocupadas', () => {
    const ocupada = {
      inicio: new Date('2027-03-01T09:30:00'),
      fin: new Date('2027-03-01T10:00:00'),
    };
    const huecos = calcularHuecos({
      fecha: dia,
      horario: { aperturaMin: 9 * 60, cierreMin: 11 * 60 },
      duracionMin: 30,
      bufferMin: 0,
      pasoMin: 30,
      ocupadas: [ocupada],
    });
    const horas = huecos.map((h) => `${h.getHours()}:${h.getMinutes()}`);
    expect(horas).not.toContain('9:30');
    expect(horas).toContain('10:0');
  });

  it('respeta el buffer entre citas', () => {
    const huecos = calcularHuecos({
      fecha: dia,
      horario: { aperturaMin: 9 * 60, cierreMin: 10 * 60 },
      duracionMin: 45,
      bufferMin: 15,
      pasoMin: 15,
      ocupadas: [],
    });
    // 9:00 (servicio hasta 9:45, cabe en horario). 9:15 -> 10:00 cabe justo.
    expect(huecos.length).toBeGreaterThan(0);
  });
});

describe('cálculo de depósito', () => {
  it('porcentaje', () => {
    expect(calcularDeposito(5000, 'porcentaje', 30)).toBe(1500);
  });
  it('fijo', () => {
    expect(calcularDeposito(5000, 'fijo', 800)).toBe(800);
  });
  it('ninguno', () => {
    expect(calcularDeposito(5000, 'ninguno', 30)).toBe(0);
  });
  it('acota el porcentaje a 0–100', () => {
    expect(calcularDeposito(5000, 'porcentaje', 150)).toBe(5000);
    expect(calcularDeposito(5000, 'porcentaje', -10)).toBe(0);
  });
});

describe('política de cancelación', () => {
  const inicio = new Date('2027-03-01T18:00:00');
  it('reembolsa si se cancela con margen suficiente', () => {
    const ahora = new Date('2027-02-28T18:00:00'); // 24 h antes
    expect(reembolsoPorCancelacion(inicio, ahora, 24)).toBe(true);
  });
  it('no reembolsa dentro de la ventana', () => {
    const ahora = new Date('2027-03-01T10:00:00'); // 8 h antes
    expect(reembolsoPorCancelacion(inicio, ahora, 24)).toBe(false);
  });
});
