import {
  CONFIG_RESTAURANTE_DEFECTO,
  aforoDia,
  diaSemanaDe,
  parseConfigRestaurante,
} from '@/lib/restaurante/config';
import {
  intervaloTurno,
  plazasDisponibles,
  plazasPorTurno,
  turnoTieneHueco,
  validarComensales,
} from '@/lib/restaurante/disponibilidad';
import { describe, expect, it } from 'vitest';

describe('config de restaurante', () => {
  it('rellena valores por defecto con JSON vacío', () => {
    const c = parseConfigRestaurante({});
    expect(c.turnos).toHaveLength(2);
    expect(c.capacidadPorMesa).toBe(4);
    expect(c.mesasPorDia.lun).toBe(10);
  });

  it('descarta turnos con horas inválidas y respeta los válidos', () => {
    const c = parseConfigRestaurante({
      turnos: [
        { id: 'x', nombre: 'Malo', inicio: '25:00', fin: '26:00' },
        { id: 'com', nombre: 'Comida', inicio: '13:00', fin: '16:00' },
      ],
    });
    expect(c.turnos).toHaveLength(1);
    expect(c.turnos[0].nombre).toBe('Comida');
  });

  it('acota mesas y capacidad a rangos válidos', () => {
    const c = parseConfigRestaurante({
      mesasPorDia: { lun: -5 },
      capacidadPorMesa: 999,
    });
    expect(c.mesasPorDia.lun).toBe(0);
    expect(c.capacidadPorMesa).toBe(50);
  });

  it('calcula el día de la semana lun-first', () => {
    // 2027-03-01 es lunes.
    expect(diaSemanaDe(new Date('2027-03-01T12:00:00'))).toBe('lun');
    // 2027-03-07 es domingo.
    expect(diaSemanaDe(new Date('2027-03-07T12:00:00'))).toBe('dom');
  });

  it('calcula el aforo del día (mesas × capacidad)', () => {
    const c = CONFIG_RESTAURANTE_DEFECTO;
    // Lunes: 10 mesas × 4 = 40.
    expect(aforoDia(c, new Date('2027-03-01T12:00:00'))).toBe(40);
  });
});

describe('disponibilidad de restaurante', () => {
  it('plazas disponibles nunca es negativo', () => {
    expect(plazasDisponibles(40, 50)).toBe(0);
    expect(plazasDisponibles(40, 10)).toBe(30);
  });

  it('turno tiene hueco solo si caben los comensales', () => {
    expect(turnoTieneHueco(40, 36, 4)).toBe(true);
    expect(turnoTieneHueco(40, 37, 4)).toBe(false);
    expect(turnoTieneHueco(40, 0, 0)).toBe(false);
  });

  it('valida el tamaño del grupo', () => {
    expect(validarComensales(4, 8).ok).toBe(true);
    expect(validarComensales(0, 8).ok).toBe(false);
    expect(validarComensales(9, 8).ok).toBe(false);
  });

  it('construye el intervalo de un turno en la fecha dada', () => {
    const { inicio, fin } = intervaloTurno(new Date('2027-03-01T00:00:00'), {
      inicio: '13:00',
      fin: '16:00',
    });
    expect(inicio.getHours()).toBe(13);
    expect(fin.getHours()).toBe(16);
  });

  it('agrega plazas por turno descontando reservas', () => {
    const c = CONFIG_RESTAURANTE_DEFECTO;
    const res = plazasPorTurno(c, 40, { comida: 30 });
    const comida = res.find((r) => r.turno.id === 'comida');
    const cena = res.find((r) => r.turno.id === 'cena');
    expect(comida?.disponibles).toBe(10);
    expect(cena?.disponibles).toBe(40);
  });
});
