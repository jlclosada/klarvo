"use client";

import { guardarConfigRestaurante } from "@/lib/restaurante/actions";
import type { ConfigRestaurante, TurnoRestaurante } from "@/lib/restaurante/config";
import { DIAS_SEMANA } from "@/lib/restaurante/config";
import { cn } from "@/lib/utils";
import { Check, Loader2, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const ETIQUETA_DIA: Record<string, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

function slugTurno(nombre: string, i: number): string {
  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `turno-${i + 1}`;
}

export function AjustesRestaurante({
  config,
  deshabilitado,
  onSaved,
  refrescarAlGuardar = true,
}: {
  config: ConfigRestaurante;
  deshabilitado?: boolean;
  onSaved?: () => void;
  /** Refresca los datos del servidor tras guardar. Desactívalo en onboarding. */
  refrescarAlGuardar?: boolean;
}) {
  const router = useRouter();
  const [mesasPorDia, setMesasPorDia] = useState<Record<string, number>>({
    ...config.mesasPorDia,
  });
  const [capacidadPorMesa, setCapacidadPorMesa] = useState(
    config.capacidadPorMesa,
  );
  const [tamanoMaxGrupo, setTamanoMaxGrupo] = useState(config.tamanoMaxGrupo);
  const [duracionMesaMin, setDuracionMesaMin] = useState(config.duracionMesaMin);
  const [turnos, setTurnos] = useState<TurnoRestaurante[]>(config.turnos);

  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const aforoSemana = useMemo(
    () =>
      DIAS_SEMANA.reduce(
        (acc, d) => acc + (mesasPorDia[d] ?? 0) * capacidadPorMesa,
        0,
      ),
    [mesasPorDia, capacidadPorMesa],
  );

  function actualizarTurno(
    i: number,
    campo: keyof TurnoRestaurante,
    valor: string,
  ) {
    setTurnos((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [campo]: valor } : t)),
    );
  }

  function anadirTurno() {
    setTurnos((prev) => [
      ...prev,
      {
        id: `turno-${prev.length + 1}`,
        nombre: "",
        inicio: "13:00",
        fin: "16:00",
      },
    ]);
  }

  function quitarTurno(i: number) {
    setTurnos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function guardar() {
    setError(null);
    setEstado("idle");

    if (turnos.length === 0) {
      setEstado("error");
      setError("Configura al menos un turno de comida.");
      return;
    }

    const payload: ConfigRestaurante = {
      mesasPorDia: Object.fromEntries(
        DIAS_SEMANA.map((d) => [d, Number(mesasPorDia[d]) || 0]),
      ) as ConfigRestaurante["mesasPorDia"],
      capacidadPorMesa: Number(capacidadPorMesa) || 1,
      tamanoMaxGrupo: Number(tamanoMaxGrupo) || 1,
      duracionMesaMin: Number(duracionMesaMin) || 120,
      turnos: turnos.map((t, i) => ({
        ...t,
        id: slugTurno(t.nombre, i),
        nombre: t.nombre.trim(),
      })),
    };

    startTransition(async () => {
      const res = await guardarConfigRestaurante(payload);
      if (res.ok) {
        setEstado("ok");
        onSaved?.();
        if (refrescarAlGuardar) router.refresh();
      } else {
        setEstado("error");
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <UtensilsCrossed className="h-5 w-5 text-brand-600" />
            Reservas de restaurante
          </h2>
          <p className="mt-1 max-w-lg text-sm text-ink-500">
            Configura tus mesas, turnos y aforo. Tus clientes reservarán
            indicando el número de comensales.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-500 sm:inline">
          {aforoSemana} plazas/semana
        </span>
      </div>

      {/* Aforo por mesa y grupo */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <CampoNumero
          label="Comensales por mesa"
          value={capacidadPorMesa}
          min={1}
          max={50}
          onChange={setCapacidadPorMesa}
          disabled={deshabilitado}
        />
        <CampoNumero
          label="Grupo máx. por reserva"
          value={tamanoMaxGrupo}
          min={1}
          max={100}
          onChange={setTamanoMaxGrupo}
          disabled={deshabilitado}
        />
        <CampoNumero
          label="Duración mesa (min)"
          value={duracionMesaMin}
          min={30}
          max={480}
          step={15}
          onChange={setDuracionMesaMin}
          disabled={deshabilitado}
        />
      </div>

      {/* Mesas por día */}
      <div className="mt-6">
        <p className="text-sm font-medium text-ink-700">Mesas disponibles por día</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {DIAS_SEMANA.map((d) => (
            <label
              key={d}
              className="flex items-center justify-between rounded-2xl border border-ink-100 px-4 py-2.5"
            >
              <span className="text-sm text-ink-700">{ETIQUETA_DIA[d]}</span>
              <input
                type="number"
                min={0}
                max={500}
                value={mesasPorDia[d] ?? 0}
                disabled={deshabilitado}
                onChange={(e) =>
                  setMesasPorDia((prev) => ({
                    ...prev,
                    [d]: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="w-20 rounded-xl border border-ink-200 px-2 py-1.5 text-right text-sm outline-none focus:border-brand-400 disabled:opacity-60"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Turnos */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-700">Turnos de comida</p>
          <button
            type="button"
            onClick={anadirTurno}
            disabled={deshabilitado}
            className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir turno
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {turnos.map((t, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-100 px-3 py-2.5"
            >
              <input
                value={t.nombre}
                placeholder="Comida"
                disabled={deshabilitado}
                onChange={(e) => actualizarTurno(i, "nombre", e.target.value)}
                className="min-w-[8rem] flex-1 rounded-xl border border-ink-200 px-3 py-1.5 text-sm outline-none focus:border-brand-400 disabled:opacity-60"
                aria-label="Nombre del turno"
              />
              <input
                type="time"
                value={t.inicio}
                disabled={deshabilitado}
                onChange={(e) => actualizarTurno(i, "inicio", e.target.value)}
                className="rounded-xl border border-ink-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 disabled:opacity-60"
                aria-label="Inicio del turno"
              />
              <span className="text-xs text-ink-400">a</span>
              <input
                type="time"
                value={t.fin}
                disabled={deshabilitado}
                onChange={(e) => actualizarTurno(i, "fin", e.target.value)}
                className="rounded-xl border border-ink-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400 disabled:opacity-60"
                aria-label="Fin del turno"
              />
              <button
                type="button"
                onClick={() => quitarTurno(i)}
                disabled={deshabilitado}
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Eliminar turno"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {turnos.length === 0 && (
            <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-400">
              Añade al menos un turno (p. ej. Comida y Cena).
            </p>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={guardar}
        disabled={pendiente || deshabilitado}
        className={cn("btn-primary mt-6 w-full sm:w-auto")}
      >
        {pendiente ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : estado === "ok" ? (
          <>
            <Check className="h-4 w-4" />
            Guardado
          </>
        ) : (
          "Guardar configuración"
        )}
      </button>
      {deshabilitado && (
        <p className="mt-2 text-xs text-ink-400">
          Conecta tu cuenta para guardar cambios.
        </p>
      )}
    </div>
  );
}

function CampoNumero({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="rounded-2xl border border-ink-100 bg-ink-50/40 px-4 py-3">
      <span className="block text-xs text-ink-400">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full bg-transparent text-sm font-semibold text-ink-900 outline-none disabled:opacity-60"
      />
    </label>
  );
}
