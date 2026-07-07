/**
 * Cálculo de disponibilidad de citas.
 * Genera los huecos libres de un profesional dado su horario, la duración del
 * servicio (más el buffer entre citas) y las citas ya ocupadas.
 */

export interface Intervalo {
  inicio: Date;
  fin: Date;
}

export interface HorarioDia {
  /** Minutos desde medianoche en que abre (ej. 9:00 -> 540). */
  aperturaMin: number;
  /** Minutos desde medianoche en que cierra (ej. 18:00 -> 1080). */
  cierreMin: number;
}

export interface ParametrosDisponibilidad {
  fecha: Date; // día a calcular (se usa a medianoche local)
  horario: HorarioDia;
  duracionMin: number;
  bufferMin: number;
  /** Paso de la rejilla de huecos en minutos (ej. cada 15 min). */
  pasoMin?: number;
  ocupadas: Intervalo[];
}

function seSolapan(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}

/**
 * Devuelve la lista de horas de inicio disponibles para un servicio.
 * Un hueco es válido si el servicio + buffer cabe dentro del horario y no se
 * solapa con ninguna cita ocupada.
 */
export function calcularHuecos(p: ParametrosDisponibilidad): Date[] {
  const paso = p.pasoMin ?? 15;
  const base = new Date(p.fecha);
  base.setHours(0, 0, 0, 0);

  const huecos: Date[] = [];
  const duracionTotal = p.duracionMin + p.bufferMin;

  for (
    let min = p.horario.aperturaMin;
    min + p.duracionMin <= p.horario.cierreMin;
    min += paso
  ) {
    const inicio = new Date(base.getTime() + min * 60_000);
    const fin = new Date(inicio.getTime() + duracionTotal * 60_000);
    const candidato: Intervalo = { inicio, fin };

    const chocan = p.ocupadas.some((o) => seSolapan(candidato, o));
    if (!chocan) huecos.push(inicio);
  }

  return huecos;
}

/** Calcula el importe del depósito en céntimos según el tipo configurado. */
export function calcularDeposito(
  precioCents: number,
  tipo: 'porcentaje' | 'fijo' | 'ninguno',
  valor: number,
): number {
  if (tipo === 'ninguno') return 0;
  if (tipo === 'fijo') return Math.max(0, Math.round(valor));
  // porcentaje
  const pct = Math.min(100, Math.max(0, valor));
  return Math.round((precioCents * pct) / 100);
}

/**
 * Determina si una cancelación da derecho a reembolso del depósito según la
 * política del negocio (ventana en horas antes del inicio de la cita).
 */
export function reembolsoPorCancelacion(
  inicioCita: Date,
  ahora: Date,
  ventanaHoras: number,
): boolean {
  const margenMs = ventanaHoras * 60 * 60 * 1000;
  return inicioCita.getTime() - ahora.getTime() >= margenMs;
}
