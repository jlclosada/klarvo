"use client";

import type { ResumenOnboarding } from "@/lib/db/panel";
import { guardarHorarioNegocio } from "@/lib/negocio/actions";
import { crearServicio } from "@/lib/servicios/actions";
import {
    ArrowRight,
    Check,
    Clock,
    Loader2,
    PartyPopper,
    Plus,
    Scissors,
    Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Preset {
  nombre: string;
  duracionMin: number;
  precioEuros: number;
}

const PRESETS: Record<string, Preset[]> = {
  peluqueria: [
    { nombre: "Corte + peinado", duracionMin: 45, precioEuros: 25 },
    { nombre: "Barba premium", duracionMin: 30, precioEuros: 15 },
    { nombre: "Color completo", duracionMin: 90, precioEuros: 55 },
  ],
  estetica: [
    { nombre: "Manicura semipermanente", duracionMin: 60, precioEuros: 30 },
    { nombre: "Pedicura", duracionMin: 60, precioEuros: 35 },
    { nombre: "Diseño de cejas", duracionMin: 30, precioEuros: 18 },
  ],
  masaje: [
    { nombre: "Masaje relajante 60'", duracionMin: 60, precioEuros: 50 },
    { nombre: "Masaje descontracturante", duracionMin: 45, precioEuros: 45 },
    { nombre: "Ritual spa", duracionMin: 90, precioEuros: 80 },
  ],
  fisio: [
    { nombre: "Sesión de fisioterapia", duracionMin: 45, precioEuros: 45 },
    { nombre: "Punción seca", duracionMin: 30, precioEuros: 40 },
    { nombre: "Primera valoración", duracionMin: 60, precioEuros: 55 },
  ],
  fitness: [
    { nombre: "Entrenamiento personal", duracionMin: 60, precioEuros: 40 },
    { nombre: "Sesión dúo", duracionMin: 60, precioEuros: 60 },
    { nombre: "Valoración inicial", duracionMin: 45, precioEuros: 30 },
  ],
  bienestar: [
    { nombre: "Sesión individual", duracionMin: 60, precioEuros: 60 },
    { nombre: "Primera consulta", duracionMin: 75, precioEuros: 70 },
    { nombre: "Seguimiento", duracionMin: 45, precioEuros: 45 },
  ],
};

const DIAS: { id: string; label: string; defecto: boolean }[] = [
  { id: "lun", label: "Lunes", defecto: true },
  { id: "mar", label: "Martes", defecto: true },
  { id: "mie", label: "Miércoles", defecto: true },
  { id: "jue", label: "Jueves", defecto: true },
  { id: "vie", label: "Viernes", defecto: true },
  { id: "sab", label: "Sábado", defecto: false },
  { id: "dom", label: "Domingo", defecto: false },
];

export function OnboardingWizard({ resumen }: { resumen: ResumenOnboarding }) {
  const router = useRouter();
  const [paso, setPaso] = useState(0);

  const presets = PRESETS[resumen.vertical] ?? PRESETS.peluqueria;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-12">
      <Pasos actual={paso} />

      {paso === 0 && (
        <Bienvenida
          nombre={resumen.negocioNombre}
          onContinuar={() => setPaso(1)}
        />
      )}

      {paso === 1 && (
        <PasoServicios
          presets={presets}
          yaTeniaServicios={resumen.tieneServicios}
          onContinuar={() => setPaso(2)}
        />
      )}

      {paso === 2 && (
        <PasoHorario
          onFinalizar={() => {
            router.push("/app");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Pasos({ actual }: { actual: number }) {
  const etiquetas = ["Bienvenida", "Servicios", "Horario"];
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {etiquetas.map((e, i) => (
        <div key={e} className="flex items-center gap-2">
          <span
            className={
              "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold " +
              (i <= actual
                ? "bg-ink-900 text-white"
                : "bg-ink-100 text-ink-400")
            }
          >
            {i < actual ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span
            className={
              "hidden text-xs font-medium sm:block " +
              (i <= actual ? "text-ink-900" : "text-ink-400")
            }
          >
            {e}
          </span>
          {i < etiquetas.length - 1 && (
            <span className="mx-1 h-px w-6 bg-ink-200" />
          )}
        </div>
      ))}
    </div>
  );
}

function Bienvenida({
  nombre,
  onContinuar,
}: {
  nombre: string;
  onContinuar: () => void;
}) {
  return (
    <div className="rounded-3xl border border-ink-200/70 bg-white p-8 text-center shadow-soft">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
        <PartyPopper className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold text-ink-900">
        ¡Bienvenida, {nombre}!
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        Vamos a dejar tu cuenta lista en dos pasos: añade tus servicios y define
        tu horario de apertura. Podrás cambiarlo todo más tarde en Ajustes.
      </p>
      <button onClick={onContinuar} className="btn-primary mx-auto mt-6">
        Empezar
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PasoServicios({
  presets,
  yaTeniaServicios,
  onContinuar,
}: {
  presets: Preset[];
  yaTeniaServicios: boolean;
  onContinuar: () => void;
}) {
  const [creados, setCreados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [creando, setCreando] = useState<string | null>(null);

  // Formulario manual.
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("45");
  const [precio, setPrecio] = useState("");

  const puedeContinuar = yaTeniaServicios || creados.length > 0;

  function anadir(preset: Preset) {
    if (creados.includes(preset.nombre)) return;
    setCreando(preset.nombre);
    setError(null);
    startTransition(async () => {
      const res = await crearServicio({
        nombre: preset.nombre,
        duracionMin: preset.duracionMin,
        precioCents: Math.round(preset.precioEuros * 100),
        depositoTipo: "ninguno",
        depositoValor: 0,
      });
      setCreando(null);
      if (res.ok) setCreados((prev) => [...prev, preset.nombre]);
      else setError(res.error ?? "No se pudo añadir el servicio.");
    });
  }

  function anadirManual(e: React.FormEvent) {
    e.preventDefault();
    const precioNum = Number(precio.replace(",", "."));
    if (!nombre.trim() || Number.isNaN(precioNum)) {
      setError("Escribe un nombre y un precio válidos.");
      return;
    }
    setCreando(nombre);
    setError(null);
    startTransition(async () => {
      const res = await crearServicio({
        nombre: nombre.trim(),
        duracionMin: Number(duracion) || 45,
        precioCents: Math.round(precioNum * 100),
        depositoTipo: "ninguno",
        depositoValor: 0,
      });
      setCreando(null);
      if (res.ok) {
        setCreados((prev) => [...prev, nombre.trim()]);
        setNombre("");
        setPrecio("");
      } else {
        setError(res.error ?? "No se pudo añadir el servicio.");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-ink-200/70 bg-white p-8 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
        <Scissors className="h-5 w-5 text-brand-600" />
        Añade tus servicios
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        Elige de las sugerencias o crea uno a medida. Necesitas al menos uno.
      </p>

      {/* Sugerencias */}
      <div className="mt-5 space-y-2">
        {presets.map((p) => {
          const hecho = creados.includes(p.nombre);
          return (
            <button
              key={p.nombre}
              onClick={() => anadir(p)}
              disabled={hecho || pendiente}
              className={
                "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors " +
                (hecho
                  ? "border-accent-500/40 bg-accent-50/50"
                  : "border-ink-100 hover:border-brand-300 hover:bg-brand-50/40")
              }
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{p.nombre}</p>
                <p className="text-xs text-ink-400">
                  {p.duracionMin} min · {p.precioEuros} €
                </p>
              </div>
              {hecho ? (
                <Check className="h-4 w-4 text-accent-600" />
              ) : creando === p.nombre ? (
                <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
              ) : (
                <Plus className="h-4 w-4 text-ink-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Alta manual */}
      <form
        onSubmit={anadirManual}
        className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2"
      >
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Otro servicio"
          className="rounded-2xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
        />
        <input
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
          inputMode="numeric"
          className="w-20 rounded-2xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          aria-label="Duración en minutos"
        />
        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          inputMode="decimal"
          placeholder="€"
          className="w-20 rounded-2xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          aria-label="Precio en euros"
        />
        <button
          type="submit"
          disabled={pendiente}
          className="col-span-3 mt-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-ink-200 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Añadir servicio
        </button>
      </form>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {creados.length > 0 && (
        <p className="mt-3 text-xs text-accent-700">
          {creados.length} servicio{creados.length > 1 ? "s" : ""} añadido
          {creados.length > 1 ? "s" : ""}.
        </p>
      )}

      <button
        onClick={onContinuar}
        disabled={!puedeContinuar}
        className="btn-primary mt-6 w-full"
      >
        Continuar
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PasoHorario({ onFinalizar }: { onFinalizar: () => void }) {
  const [dias, setDias] = useState<Record<string, boolean>>(
    Object.fromEntries(DIAS.map((d) => [d.id, d.defecto])),
  );
  const [apertura, setApertura] = useState("09:00");
  const [cierre, setCierre] = useState("19:00");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function guardar() {
    setError(null);
    const horario = Object.fromEntries(
      DIAS.map((d) => [d.id, dias[d.id] ? [[apertura, cierre]] : []]),
    );
    startTransition(async () => {
      const res = await guardarHorarioNegocio(horario);
      if (res.ok) onFinalizar();
      else setError(res.error ?? "No se pudo guardar el horario.");
    });
  }

  return (
    <div className="rounded-3xl border border-ink-200/70 bg-white p-8 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
        <Clock className="h-5 w-5 text-brand-600" />
        Tu horario de apertura
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        Marca los días que abres. Usaremos este horario para tus reservas.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          Abre
          <input
            type="time"
            value={apertura}
            onChange={(e) => setApertura(e.target.value)}
            className="rounded-xl border border-ink-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          Cierra
          <input
            type="time"
            value={cierre}
            onChange={(e) => setCierre(e.target.value)}
            className="rounded-xl border border-ink-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
          />
        </label>
      </div>

      <div className="mt-4 space-y-1.5">
        {DIAS.map((d) => (
          <label
            key={d.id}
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-ink-100 px-4 py-2.5"
          >
            <span className="text-sm text-ink-700">{d.label}</span>
            <input
              type="checkbox"
              checked={dias[d.id]}
              onChange={(e) =>
                setDias((prev) => ({ ...prev, [d.id]: e.target.checked }))
              }
              className="h-4 w-4 accent-brand-600"
            />
          </label>
        ))}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <button
        onClick={guardar}
        disabled={pendiente}
        className="btn-primary mt-6 w-full"
      >
        {pendiente ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Finalizar y entrar
            <Store className="h-4 w-4" />
          </>
        )}
      </button>
      <button
        onClick={onFinalizar}
        className="mt-2 w-full text-center text-xs text-ink-400 hover:text-ink-600"
      >
        Omitir por ahora
      </button>
    </div>
  );
}
