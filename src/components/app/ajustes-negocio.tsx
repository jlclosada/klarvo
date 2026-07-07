"use client";

import type { DatosFiscales, HorarioSemana } from "@/lib/db/panel";
import {
    guardarDatosNegocio,
    guardarHorarioNegocio,
} from "@/lib/negocio/actions";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const DIAS: { id: string; label: string }[] = [
  { id: "lun", label: "Lunes" },
  { id: "mar", label: "Martes" },
  { id: "mie", label: "Miércoles" },
  { id: "jue", label: "Jueves" },
  { id: "vie", label: "Viernes" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
];

interface DiaEstado {
  abierto: boolean;
  apertura: string;
  cierre: string;
}

function horarioAEstado(horario: HorarioSemana): Record<string, DiaEstado> {
  const out: Record<string, DiaEstado> = {};
  for (const { id } of DIAS) {
    const rangos = horario[id];
    if (rangos && rangos.length > 0) {
      out[id] = { abierto: true, apertura: rangos[0][0], cierre: rangos[0][1] };
    } else {
      out[id] = { abierto: false, apertura: "09:00", cierre: "19:00" };
    }
  }
  return out;
}

export function AjustesNegocio({
  nombre,
  fiscales,
  horario,
  slug,
  vertical,
  publicUrl,
  deshabilitado,
}: {
  nombre: string;
  fiscales: DatosFiscales;
  horario: HorarioSemana;
  slug: string;
  vertical: string;
  publicUrl: string;
  deshabilitado?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DatosNegocio
        nombre={nombre}
        fiscales={fiscales}
        slug={slug}
        vertical={vertical}
        publicUrl={publicUrl}
        deshabilitado={deshabilitado}
        onSaved={() => router.refresh()}
      />
      <HorarioEditable
        horario={horario}
        deshabilitado={deshabilitado}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}

function DatosNegocio({
  nombre: nombreInicial,
  fiscales,
  slug,
  vertical,
  publicUrl,
  deshabilitado,
  onSaved,
}: {
  nombre: string;
  fiscales: DatosFiscales;
  slug: string;
  vertical: string;
  publicUrl: string;
  deshabilitado?: boolean;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nombre: nombreInicial,
    nif: fiscales.nif,
    direccion: fiscales.direccion,
    poblacion: fiscales.poblacion,
    cp: fiscales.cp,
  });
  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function guardar() {
    setError(null);
    setEstado("idle");
    startTransition(async () => {
      const res = await guardarDatosNegocio(form);
      if (res.ok) {
        setEstado("ok");
        onSaved();
      } else {
        setEstado("error");
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
      <h2 className="text-base font-semibold text-ink-900">Datos del negocio</h2>
      <div className="mt-5 space-y-4">
        <Campo label="Nombre">
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="input"
          />
        </Campo>
        <Campo label="URL pública de reservas">
          <input value={`${publicUrl}/reservar/${slug}`} disabled className="input opacity-70" />
        </Campo>
        <Campo label="Tipo de negocio">
          <input value={vertical} disabled className="input capitalize opacity-70" />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="NIF / CIF">
            <input
              value={form.nif}
              onChange={(e) => setForm({ ...form, nif: e.target.value })}
              placeholder="B12345678"
              className="input"
            />
          </Campo>
          <Campo label="Código postal">
            <input
              value={form.cp}
              onChange={(e) => setForm({ ...form, cp: e.target.value })}
              placeholder="28001"
              className="input"
            />
          </Campo>
        </div>
        <Campo label="Dirección fiscal">
          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            placeholder="Calle Mayor, 1"
            className="input"
          />
        </Campo>
        <Campo label="Población">
          <input
            value={form.poblacion}
            onChange={(e) => setForm({ ...form, poblacion: e.target.value })}
            placeholder="Madrid"
            className="input"
          />
        </Campo>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {estado === "ok" && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-accent-700">
          <Check className="h-3.5 w-3.5" />
          Guardado.
        </p>
      )}

      <button
        onClick={guardar}
        disabled={pendiente || deshabilitado || !form.nombre.trim()}
        className="btn-outline mt-5 flex w-full items-center justify-center gap-2 disabled:opacity-60"
        title={deshabilitado ? "Conecta Supabase para guardar" : undefined}
      >
        {pendiente && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar cambios
      </button>
    </div>
  );
}

function HorarioEditable({
  horario,
  deshabilitado,
  onSaved,
}: {
  horario: HorarioSemana;
  deshabilitado?: boolean;
  onSaved: () => void;
}) {
  const [dias, setDias] = useState<Record<string, DiaEstado>>(
    horarioAEstado(horario),
  );
  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function set(id: string, patch: Partial<DiaEstado>) {
    setDias((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function guardar() {
    setError(null);
    setEstado("idle");
    const horarioJson: HorarioSemana = {};
    for (const { id } of DIAS) {
      const d = dias[id];
      horarioJson[id] = d.abierto ? [[d.apertura, d.cierre]] : [];
    }
    startTransition(async () => {
      const res = await guardarHorarioNegocio(horarioJson);
      if (res.ok) {
        setEstado("ok");
        onSaved();
      } else {
        setEstado("error");
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
      <h2 className="text-base font-semibold text-ink-900">Horario de apertura</h2>
      <div className="mt-4 space-y-1.5">
        {DIAS.map(({ id, label }) => {
          const d = dias[id];
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border border-ink-100 px-3 py-2"
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={d.abierto}
                  onChange={(e) => set(id, { abierto: e.target.checked })}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-sm text-ink-700">{label}</span>
              </label>
              {d.abierto ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={d.apertura}
                    onChange={(e) => set(id, { apertura: e.target.value })}
                    className="rounded-xl border border-ink-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
                  />
                  <span className="text-ink-300">–</span>
                  <input
                    type="time"
                    value={d.cierre}
                    onChange={(e) => set(id, { cierre: e.target.value })}
                    className="rounded-xl border border-ink-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
                  />
                </div>
              ) : (
                <span className="text-xs text-ink-400">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {estado === "ok" && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-accent-700">
          <Check className="h-3.5 w-3.5" />
          Horario guardado.
        </p>
      )}

      <button
        onClick={guardar}
        disabled={pendiente || deshabilitado}
        className="btn-outline mt-5 flex w-full items-center justify-center gap-2 disabled:opacity-60"
        title={deshabilitado ? "Conecta Supabase para guardar" : undefined}
      >
        {pendiente && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar horario
      </button>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-500">
        {label}
      </label>
      {children}
    </div>
  );
}
