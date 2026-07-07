"use client";

import { Modal } from "@/components/ui/modal";
import { crearServicio } from "@/lib/servicios/actions";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const DEPOSITOS = [
  { value: "ninguno", label: "Sin depósito" },
  { value: "porcentaje", label: "Porcentaje" },
  { value: "fijo", label: "Importe fijo" },
] as const;

export function NuevoServicio({ deshabilitado }: { deshabilitado?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [form, setForm] = useState({
    nombre: "",
    duracionMin: "45",
    precioEuros: "25",
    depositoTipo: "ninguno" as "ninguno" | "porcentaje" | "fijo",
    depositoValor: "30",
  });

  function enviar() {
    setError(null);
    startTransition(async () => {
      const res = await crearServicio({
        nombre: form.nombre,
        duracionMin: Number(form.duracionMin),
        precioCents: Math.round(Number(form.precioEuros) * 100),
        depositoTipo: form.depositoTipo,
        depositoValor:
          form.depositoTipo === "fijo"
            ? Math.round(Number(form.depositoValor) * 100)
            : Number(form.depositoValor),
      });
      if (!res.ok) {
        setError(res.error ?? "No se pudo crear.");
        return;
      }
      setOpen(false);
      setForm({
        nombre: "",
        duracionMin: "45",
        precioEuros: "25",
        depositoTipo: "ninguno",
        depositoValor: "30",
      });
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={deshabilitado}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        title={deshabilitado ? "Conecta Supabase para crear servicios" : undefined}
      >
        <Plus className="h-4 w-4" />
        Nuevo servicio
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo servicio">
        <div className="space-y-3">
          <Campo label="Nombre">
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Corte + peinado"
              className="input"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Duración (min)">
              <input
                type="number"
                min={5}
                step={5}
                value={form.duracionMin}
                onChange={(e) =>
                  setForm({ ...form, duracionMin: e.target.value })
                }
                className="input"
              />
            </Campo>
            <Campo label="Precio (€)">
              <input
                type="number"
                min={0}
                step="0.5"
                value={form.precioEuros}
                onChange={(e) =>
                  setForm({ ...form, precioEuros: e.target.value })
                }
                className="input"
              />
            </Campo>
          </div>

          <Campo label="Depósito">
            <div className="grid grid-cols-3 gap-2">
              {DEPOSITOS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setForm({ ...form, depositoTipo: d.value })}
                  className={
                    form.depositoTipo === d.value
                      ? "rounded-xl border border-brand-400 bg-brand-50 py-2 text-xs font-medium text-brand-700"
                      : "rounded-xl border border-ink-200 py-2 text-xs font-medium text-ink-500 hover:border-ink-300"
                  }
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Campo>

          {form.depositoTipo !== "ninguno" && (
            <Campo
              label={
                form.depositoTipo === "porcentaje"
                  ? "Porcentaje (%)"
                  : "Importe (€)"
              }
            >
              <input
                type="number"
                min={0}
                step={form.depositoTipo === "porcentaje" ? 1 : 0.5}
                value={form.depositoValor}
                onChange={(e) =>
                  setForm({ ...form, depositoValor: e.target.value })
                }
                className="input"
              />
            </Campo>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={enviar}
            disabled={pendiente || !form.nombre.trim()}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-2.5 disabled:opacity-60"
          >
            {pendiente && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear servicio
          </button>
        </div>
      </Modal>
    </>
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
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-500">
        {label}
      </span>
      {children}
    </label>
  );
}
