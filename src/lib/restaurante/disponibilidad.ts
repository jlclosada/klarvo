/**
 * Cálculo de disponibilidad para reservas de restauración.
 *
 * El aforo de un turno se mide en comensales (mesas × aforo por mesa). Cada
 * reserva consume tantas plazas como comensales tenga. Un turno tiene hueco si
 * quedan plazas suficientes para el grupo solicitado.
 */

import type { ConfigRestaurante, TurnoRestaurante } from './config';

/** Plazas libres de un turno: aforo menos comensales ya reservados. */
export function plazasDisponibles(
  aforo: number,
  comensalesReservados: number,
): number {
  return Math.max(0, aforo - Math.max(0, comensalesReservados));
}

/** Indica si un turno admite un grupo de `comensales` personas. */
export function turnoTieneHueco(
  aforo: number,
  comensalesReservados: number,
  comensales: number,
): boolean {
  if (comensales <= 0) return false;
  return plazasDisponibles(aforo, comensalesReservados) >= comensales;
}

/** Valida que el número de comensales sea correcto para la config del negocio. */
export function validarComensales(
  comensales: number,
  tamanoMaxGrupo: number,
): { ok: boolean; error?: string } {
  if (!Number.isInteger(comensales) || comensales < 1) {
    return { ok: false, error: 'Indica al menos 1 comensal.' };
  }
  if (comensales > tamanoMaxGrupo) {
    return {
      ok: false,
      error: `El grupo máximo por reserva es de ${tamanoMaxGrupo} comensales. Llámanos para grupos mayores.`,
    };
  }
  return { ok: true };
}

/**
 * Construye el intervalo [inicio, fin] de un turno en una fecha concreta.
 * El fin se limita al horario del turno (no a la duración de mesa) para acotar
 * la ventana de solapamiento al calcular ocupación.
 */
export function intervaloTurno(
  fecha: Date,
  turno: Pick<TurnoRestaurante, 'inicio' | 'fin'>,
): { inicio: Date; fin: Date } {
  const [hi, mi] = turno.inicio.split(':').map(Number);
  const [hf, mf] = turno.fin.split(':').map(Number);
  const inicio = new Date(fecha);
  inicio.setHours(hi, mi, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(hf, mf, 0, 0);
  return { inicio, fin };
}

/** Inicio recomendado de una reserva en un turno (coincide con el turno). */
export function inicioReserva(fecha: Date, turno: TurnoRestaurante): Date {
  return intervaloTurno(fecha, turno).inicio;
}

export interface PlazasTurno {
  turno: TurnoRestaurante;
  aforo: number;
  reservados: number;
  disponibles: number;
}

/**
 * Calcula las plazas disponibles de cada turno dado el aforo del día y un mapa
 * de comensales ya reservados por turno.
 */
export function plazasPorTurno(
  config: ConfigRestaurante,
  aforo: number,
  reservadosPorTurno: Record<string, number>,
): PlazasTurno[] {
  return config.turnos.map((turno) => {
    const reservados = reservadosPorTurno[turno.id] ?? 0;
    return {
      turno,
      aforo,
      reservados,
      disponibles: plazasDisponibles(aforo, reservados),
    };
  });
}
