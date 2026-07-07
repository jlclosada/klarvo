/**
 * Modelo de configuración de reservas para negocios de restauración.
 *
 * A diferencia del resto de verticales (una cita = un servicio con un
 * profesional), un restaurante reserva **mesas** para un número de **comensales**
 * dentro de **turnos** de comida (p. ej. Comida y Cena). El propietario define
 * cuántas mesas ofrece cada día, el aforo por mesa y el tamaño máximo de grupo.
 */

/** Identificadores de los días de la semana (coinciden con el horario). */
export const DIAS_SEMANA = [
  'lun',
  'mar',
  'mie',
  'jue',
  'vie',
  'sab',
  'dom',
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

/** Un turno de comida configurable (franja horaria con nombre). */
export interface TurnoRestaurante {
  /** Identificador estable del turno (slug), p. ej. "comida". */
  id: string;
  /** Nombre visible, p. ej. "Comida" o "Cena". */
  nombre: string;
  /** Hora de inicio del turno en formato "HH:mm". */
  inicio: string;
  /** Hora de fin del turno en formato "HH:mm". */
  fin: string;
}

export interface ConfigRestaurante {
  /** Número de mesas disponibles en cada día de la semana. */
  mesasPorDia: Record<DiaSemana, number>;
  /** Comensales que admite una mesa (aforo medio por mesa). */
  capacidadPorMesa: number;
  /** Tamaño máximo de un grupo admitido en una sola reserva. */
  tamanoMaxGrupo: number;
  /** Minutos que se considera ocupada una mesa (rotación de turnos). */
  duracionMesaMin: number;
  /** Turnos de comida configurables. */
  turnos: TurnoRestaurante[];
}

/** Configuración por defecto para un restaurante recién creado. */
export const CONFIG_RESTAURANTE_DEFECTO: ConfigRestaurante = {
  mesasPorDia: {
    lun: 10,
    mar: 10,
    mie: 10,
    jue: 12,
    vie: 14,
    sab: 14,
    dom: 8,
  },
  capacidadPorMesa: 4,
  tamanoMaxGrupo: 8,
  duracionMesaMin: 120,
  turnos: [
    { id: 'comida', nombre: 'Comida', inicio: '13:00', fin: '16:00' },
    { id: 'cena', nombre: 'Cena', inicio: '20:00', fin: '23:30' },
  ],
};

function clampEntero(
  valor: unknown,
  min: number,
  max: number,
  defecto: number,
) {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return defecto;
  return Math.min(max, Math.max(min, n));
}

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Normaliza el JSON almacenado en `config_restaurante_json` a una
 * `ConfigRestaurante` completa, rellenando con los valores por defecto lo que
 * falte o sea inválido. Nunca lanza: siempre devuelve una config usable.
 */
export function parseConfigRestaurante(raw: unknown): ConfigRestaurante {
  const base = CONFIG_RESTAURANTE_DEFECTO;
  if (!raw || typeof raw !== 'object') {
    return structuredClone(base);
  }
  const obj = raw as Record<string, unknown>;

  const mesasRaw = (obj.mesasPorDia ?? {}) as Record<string, unknown>;
  const mesasPorDia = Object.fromEntries(
    DIAS_SEMANA.map((d) => [
      d,
      clampEntero(mesasRaw[d], 0, 500, base.mesasPorDia[d]),
    ]),
  ) as Record<DiaSemana, number>;

  const turnosRaw = Array.isArray(obj.turnos) ? obj.turnos : [];
  const turnos: TurnoRestaurante[] = turnosRaw
    .map((t, i) => {
      const o = (t ?? {}) as Record<string, unknown>;
      const nombre = String(o.nombre ?? '').trim() || `Turno ${i + 1}`;
      const inicio = String(o.inicio ?? '');
      const fin = String(o.fin ?? '');
      const id = String(o.id ?? '').trim() || `turno-${i + 1}`;
      if (!HORA_RE.test(inicio) || !HORA_RE.test(fin) || fin <= inicio) {
        return null;
      }
      return { id, nombre, inicio, fin };
    })
    .filter((t): t is TurnoRestaurante => t !== null);

  return {
    mesasPorDia,
    capacidadPorMesa: clampEntero(
      obj.capacidadPorMesa,
      1,
      50,
      base.capacidadPorMesa,
    ),
    tamanoMaxGrupo: clampEntero(
      obj.tamanoMaxGrupo,
      1,
      100,
      base.tamanoMaxGrupo,
    ),
    duracionMesaMin: clampEntero(
      obj.duracionMesaMin,
      30,
      480,
      base.duracionMesaMin,
    ),
    turnos: turnos.length > 0 ? turnos : structuredClone(base.turnos),
  };
}

/** Índice (0=lun … 6=dom) del día de la semana de una fecha. */
export function diaSemanaDe(fecha: Date): DiaSemana {
  // getDay(): 0=domingo … 6=sábado. Reordenamos a lun-first.
  const idx = (fecha.getDay() + 6) % 7;
  return DIAS_SEMANA[idx];
}

/** Aforo total (en comensales) de un día concreto según la config. */
export function aforoDia(config: ConfigRestaurante, fecha: Date): number {
  const dia = diaSemanaDe(fecha);
  return (config.mesasPorDia[dia] ?? 0) * config.capacidadPorMesa;
}
