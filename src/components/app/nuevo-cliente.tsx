"use client";

import { Modal } from "@/components/ui/modal";
import { crearCliente } from "@/lib/clientes/actions";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function NuevoCliente({ deshabilitado }: { deshabilitado?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    etiquetas: "",
  });

  function enviar() {
    setError(null);
    startTransition(async () => {
      const etiquetas = form.etiquetas
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await crearCliente({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        etiquetas,
      });
      if (!res.ok) {
        setError(res.error ?? "No se pudo crear.");
        return;
      }
      setOpen(false);
      setForm({ nombre: "", email: "", telefono: "", etiquetas: "" });
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={deshabilitado}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        title={deshabilitado ? "Conecta Supabase para crear clientes" : undefined}
      >
        <Plus className="h-4 w-4" />
        Nuevo cliente
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo cliente">
        <div className="space-y-3">
          <Campo label="Nombre y apellidos">
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Lucía Martín"
              className="input"
            />
          </Campo>
          <Campo label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="lucia@email.com"
              className="input"
            />
          </Campo>
          <Campo label="Teléfono">
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="+34 611 22 33 44"
              className="input"
            />
          </Campo>
          <Campo label="Etiquetas (separadas por comas)">
            <input
              value={form.etiquetas}
              onChange={(e) => setForm({ ...form, etiquetas: e.target.value })}
              placeholder="VIP, Color"
              className="input"
            />
          </Campo>

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
            Crear cliente
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
