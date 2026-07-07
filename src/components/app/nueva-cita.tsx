"use client";

import { Modal } from "@/components/ui/modal";
import { crearCitaManual } from "@/lib/citas/actions";
import type { ClientePanel, ServicioPanel } from "@/lib/db/panel";
import { formatMoney } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function NuevaCita({
  fecha,
  servicios,
  clientes,
  deshabilitado,
  horaInicial,
  variante = "boton",
  servicioInicialId,
  onDone,
}: {
  fecha: string; // YYYY-MM-DD del día visible
  servicios: ServicioPanel[];
  clientes: ClientePanel[];
  deshabilitado?: boolean;
  horaInicial?: string;
  variante?: "boton" | "controlado";
  servicioInicialId?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(variante === "controlado");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const [servicioId, setServicioId] = useState(
    servicioInicialId ?? servicios[0]?.id ?? "",
  );
  const [modoCliente, setModoCliente] = useState<"existente" | "nuevo">(
    clientes.length > 0 ? "existente" : "nuevo",
  );
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [clienteNombre, setClienteNombre] = useState("");
  const [hora, setHora] = useState(horaInicial ?? "10:00");

  function cerrar() {
    setOpen(false);
    onDone?.();
  }

  function enviar() {
    setError(null);
    startTransition(async () => {
      const res = await crearCitaManual({
        servicioId,
        clienteId: modoCliente === "existente" ? clienteId || undefined : undefined,
        clienteNombre: modoCliente === "nuevo" ? clienteNombre : undefined,
        fecha,
        hora,
      });
      if (!res.ok) {
        setError(res.error ?? "No se pudo crear la cita.");
        return;
      }
      setClienteNombre("");
      cerrar();
      router.refresh();
    });
  }

  const contenido = (
    <div className="space-y-3">
      <Campo label="Servicio">
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          className="input"
        >
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} · {s.duracionMin} min · {formatMoney(s.precioCents)}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Cliente">
        <div className="mb-2 flex gap-1.5">
          <TabCliente
            activo={modoCliente === "existente"}
            onClick={() => setModoCliente("existente")}
            disabled={clientes.length === 0}
          >
            Existente
          </TabCliente>
          <TabCliente
            activo={modoCliente === "nuevo"}
            onClick={() => setModoCliente("nuevo")}
          >
            Nuevo
          </TabCliente>
        </div>
        {modoCliente === "existente" ? (
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="input"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            placeholder="Nombre del cliente (opcional)"
            className="input"
          />
        )}
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Fecha">
          <input value={fecha} disabled className="input opacity-70" />
        </Campo>
        <Campo label="Hora">
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="input"
          />
        </Campo>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={enviar}
        disabled={pendiente || !servicioId}
        className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-2.5 disabled:opacity-60"
      >
        {pendiente && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear cita
      </button>
    </div>
  );

  if (variante === "controlado") {
    return (
      <Modal open={open} onClose={cerrar} title="Nueva cita">
        {contenido}
      </Modal>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={deshabilitado}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        title={deshabilitado ? "Conecta Supabase para crear citas" : undefined}
      >
        <Plus className="h-4 w-4" />
        Añadir cita
      </button>

      <Modal open={open} onClose={cerrar} title="Nueva cita">
        {contenido}
      </Modal>
    </>
  );
}

function TabCliente({
  activo,
  onClick,
  disabled,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 " +
        (activo
          ? "bg-ink-900 text-white"
          : "bg-ink-100 text-ink-500 hover:bg-ink-200")
      }
    >
      {children}
    </button>
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
      <label className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
    </div>
  );
}
