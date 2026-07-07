"use client";

import {
    crearReservaRestaurante,
    disponibilidadRestaurante,
    type DisponibilidadTurnoDTO,
} from "@/lib/reservas/actions";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    CalendarCheck,
    Check,
    ChevronLeft,
    Clock,
    Loader2,
    Minus,
    Plus,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useState, useTransition } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Paso = 1 | 2 | 3 | 4;

interface Props {
  negocioSlug: string;
  negocioNombre: string;
  tamanoMaxGrupo: number;
  fechaInicialISO: string;
  turnosIniciales: DisponibilidadTurnoDTO[];
}

/** Devuelve las próximas `n` fechas (incluye hoy) como ISO "yyyy-mm-dd". */
function proximasFechas(n: number): { iso: string; etiqueta: string }[] {
  const out: { iso: string; etiqueta: string }[] = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const etiqueta =
      i === 0
        ? "Hoy"
        : i === 1
          ? "Mañana"
          : d.toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
    out.push({ iso, etiqueta });
  }
  return out;
}

export function BookingFlowRestaurante({
  negocioSlug,
  negocioNombre,
  tamanoMaxGrupo,
  fechaInicialISO,
  turnosIniciales,
}: Props) {
  const fechas = proximasFechas(30);

  const [paso, setPaso] = useState<Paso>(1);
  const [fecha, setFecha] = useState(fechaInicialISO);
  const [turnos, setTurnos] = useState<DisponibilidadTurnoDTO[]>(turnosIniciales);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [turnoId, setTurnoId] = useState<string | null>(null);
  const [comensales, setComensales] = useState(2);
  const [consent, setConsent] = useState(false);
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "" });
  const [error, setError] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  const turnoSel = turnos.find((t) => t.turnoId === turnoId) ?? null;
  const pasos = ["Fecha y turno", "Comensales", "Tus datos", "Confirmación"];

  async function cambiarFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setTurnoId(null);
    setCargandoTurnos(true);
    try {
      const nuevos = await disponibilidadRestaurante(negocioSlug, nuevaFecha);
      setTurnos(nuevos);
    } catch {
      setTurnos([]);
    } finally {
      setCargandoTurnos(false);
    }
  }

  function elegirTurno(t: DisponibilidadTurnoDTO) {
    if (t.disponibles <= 0) return;
    setTurnoId(t.turnoId);
    // Ajusta comensales al máximo disponible si excede.
    setComensales((c) => Math.min(c, Math.min(tamanoMaxGrupo, t.disponibles)));
    setPaso(2);
  }

  function confirmar() {
    if (!turnoId) return;
    setError(null);
    startTransition(async () => {
      const res = await crearReservaRestaurante({
        negocioSlug,
        fechaISO: fecha,
        turnoId,
        comensales,
        cliente: datos,
        consentimientoRgpd: consent,
      });
      if (!res.ok) {
        setError(res.error ?? "No se pudo completar la reserva.");
        return;
      }
      if (res.tokenGestion) {
        window.location.href = `/cita/${res.tokenGestion}?pago=ok`;
      }
    });
  }

  const maxComensales = turnoSel
    ? Math.min(tamanoMaxGrupo, turnoSel.disponibles)
    : tamanoMaxGrupo;

  return (
    <div className="mx-auto max-w-lg">
      {/* Progreso */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {pasos.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors",
                paso > i + 1
                  ? "bg-accent-500 text-white"
                  : paso === i + 1
                    ? "bg-ink-900 text-white"
                    : "bg-ink-100 text-ink-400",
              )}
            >
              {paso > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < pasos.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  paso > i + 1 ? "bg-accent-500" : "bg-ink-200",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Paso 1: fecha y turno */}
        {paso === 1 && (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
              <CalendarCheck className="h-5 w-5 text-brand-600" />
              Elige día y turno
            </h2>

            {/* Selector de fecha */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {fechas.map((f) => (
                <button
                  key={f.iso}
                  onClick={() => cambiarFecha(f.iso)}
                  className={cn(
                    "shrink-0 rounded-2xl border px-3 py-2 text-sm font-medium capitalize transition-colors",
                    f.iso === fecha
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 text-ink-600 hover:border-brand-300 hover:bg-brand-50/40",
                  )}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>

            {/* Turnos */}
            <div className="mt-4 space-y-2">
              {cargandoTurnos ? (
                <div className="flex items-center justify-center py-8 text-ink-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : turnos.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-400">
                  No hay turnos disponibles este día.
                </p>
              ) : (
                turnos.map((t) => {
                  const agotado = t.disponibles <= 0;
                  return (
                    <button
                      key={t.turnoId}
                      onClick={() => elegirTurno(t)}
                      disabled={agotado}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                        agotado
                          ? "cursor-not-allowed border-ink-100 bg-ink-50/50 opacity-70"
                          : "border-ink-100 hover:border-brand-300 hover:bg-brand-50/40",
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {t.nombre}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-ink-400">
                          <Clock className="h-3.5 w-3.5" />
                          {t.inicio} – {t.fin}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          agotado
                            ? "bg-ink-100 text-ink-400"
                            : "bg-accent-500/10 text-accent-700",
                        )}
                      >
                        {agotado
                          ? "Completo"
                          : `${t.disponibles} plazas`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Paso 2: comensales */}
        {paso === 2 && turnoSel && (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft"
          >
            <button
              onClick={() => setPaso(1)}
              className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Cambiar turno
            </button>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
              <Users className="h-5 w-5 text-brand-600" />
              ¿Cuántos comensales?
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {turnoSel.nombre} · {turnoSel.inicio} – {turnoSel.fin}
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <button
                onClick={() => setComensales((c) => Math.max(1, c - 1))}
                disabled={comensales <= 1}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
                aria-label="Quitar comensal"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-16 text-center text-4xl font-semibold tabular-nums text-ink-900">
                {comensales}
              </span>
              <button
                onClick={() =>
                  setComensales((c) => Math.min(maxComensales, c + 1))
                }
                disabled={comensales >= maxComensales}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
                aria-label="Añadir comensal"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-ink-400">
              Máximo {maxComensales} comensales para este turno.
            </p>

            <button
              onClick={() => setPaso(3)}
              className="btn-primary mt-6 w-full"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* Paso 3: datos */}
        {paso === 3 && (
          <motion.div
            key="paso3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft"
          >
            <button
              onClick={() => setPaso(2)}
              className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="text-lg font-semibold text-ink-900">Tus datos</h2>

            <div className="mt-4 space-y-3">
              <Campo
                label="Nombre y apellidos"
                value={datos.nombre}
                onChange={(v) => setDatos((d) => ({ ...d, nombre: v }))}
                placeholder="Nombre completo"
              />
              <Campo
                label="Email"
                type="email"
                value={datos.email}
                onChange={(v) => setDatos((d) => ({ ...d, email: v }))}
                placeholder="tu@email.com"
              />
              <Campo
                label="Teléfono"
                type="tel"
                value={datos.telefono}
                onChange={(v) => setDatos((d) => ({ ...d, telefono: v }))}
                placeholder="+34 600 00 00 00"
              />
            </div>

            <label className="mt-4 flex items-start gap-2 text-xs text-ink-500">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              Acepto la política de privacidad y el tratamiento de mis datos para
              gestionar la reserva.
            </label>

            <button
              onClick={() => setPaso(4)}
              disabled={
                !datos.nombre.trim() || !datos.email.trim() || !consent
              }
              className="btn-primary mt-5 w-full"
            >
              Revisar reserva
            </button>
          </motion.div>
        )}

        {/* Paso 4: confirmación */}
        {paso === 4 && turnoSel && (
          <motion.div
            key="paso4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft"
          >
            <button
              onClick={() => setPaso(3)}
              className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <h2 className="text-lg font-semibold text-ink-900">
              Confirma tu reserva
            </h2>

            <dl className="mt-4 space-y-2 rounded-2xl bg-ink-50/60 p-4 text-sm">
              <Fila label="Restaurante" value={negocioNombre} />
              <Fila label="Turno" value={`${turnoSel.nombre} · ${turnoSel.inicio}`} />
              <Fila label="Comensales" value={String(comensales)} />
              <Fila label="A nombre de" value={datos.nombre} />
            </dl>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={confirmar}
              disabled={enviando}
              className="btn-primary mt-5 w-full"
            >
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Confirmar reserva
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sin coste. Recibirás la confirmación por email.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
      />
    </label>
  );
}

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
