"use client";

import { EstadoBadge } from "@/components/app/estado-badge";
import { NuevaCita } from "@/components/app/nueva-cita";
import {
    completarCita,
    completarYFacturarCita,
} from "@/lib/citas/actions";
import type {
    AgendaDia,
    CitaAgenda,
    ClientePanel,
    ServicioPanel
} from "@/lib/db/panel";
import { formatMoney } from "@/lib/utils";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const HORAS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 – 19:00
const PX_POR_HORA = 64;
const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function minutosDesde8(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h - 8) * 60 + m;
}

function topDeHora(hhmm: string): number {
  return (minutosDesde8(hhmm) / 60) * PX_POR_HORA;
}

function altoDeCita(inicio: string, fin: string): number {
  const dur = minutosDesde8(fin) - minutosDesde8(inicio);
  return Math.max((dur / 60) * PX_POR_HORA - 6, 44);
}

/** Devuelve el lunes de la semana que contiene la fecha dada. */
function lunesDeLaSemana(fechaISO: string): Date {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  const diaSemana = (fecha.getDay() + 6) % 7; // 0 = lunes
  fecha.setDate(fecha.getDate() - diaSemana);
  return fecha;
}

function aISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function sumarDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + dias);
  return aISO(fecha);
}

function tituloFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

interface Feedback {
  citaId: string;
  ok: boolean;
  mensaje: string;
  facturaId?: string;
}

export function AgendaDia({
  agenda,
  servicios,
  clientes,
}: {
  agenda: AgendaDia;
  servicios: ServicioPanel[];
  clientes: ClientePanel[];
}) {
  const router = useRouter();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [accionId, setAccionId] = useState<string | null>(null);
  // Prereserva rápida: al pulsar un servicio, abre el modal con ese servicio.
  const [servicioRapido, setServicioRapido] = useState<string | null>(null);

  const semana = lunesDeLaSemana(agenda.fechaISO);
  const diaAnterior = sumarDias(agenda.fechaISO, -1);
  const diaSiguiente = sumarDias(agenda.fechaISO, 1);

  const previstoCents = agenda.citas.reduce((a, c) => a + c.precioCents, 0);

  function ejecutar(
    citaId: string,
    accion: "completar" | "facturar",
  ) {
    setAccionId(`${citaId}:${accion}`);
    setFeedback(null);
    startTransition(async () => {
      const res =
        accion === "facturar"
          ? await completarYFacturarCita(citaId)
          : await completarCita(citaId);
      setAccionId(null);
      if (res.ok) {
        setFeedback({
          citaId,
          ok: true,
          mensaje:
            accion === "facturar"
              ? `Factura nº ${"numero" in res ? res.numero : ""} emitida.`
              : "Cita completada.",
          facturaId:
            accion === "facturar" && "facturaId" in res
              ? (res.facturaId as string | undefined)
              : undefined,
        });
        router.refresh();
      } else {
        setFeedback({
          citaId,
          ok: false,
          mensaje: res.error ?? "No se pudo completar la acción.",
        });
      }
    });
  }

  return (
    <div className="flex-1 p-6">
      {/* Selector de día */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/app/calendario?fecha=${diaAnterior}`}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-50"
            aria-label="Día anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            {DIAS_CORTOS.map((d, i) => {
              const fechaDia = aISO(
                new Date(
                  semana.getFullYear(),
                  semana.getMonth(),
                  semana.getDate() + i,
                ),
              );
              const activo = fechaDia === agenda.fechaISO;
              return (
                <Link
                  key={d}
                  href={`/app/calendario?fecha=${fechaDia}`}
                  className={
                    "flex h-14 w-12 flex-col items-center justify-center rounded-2xl text-sm font-medium transition-colors " +
                    (activo
                      ? "bg-ink-900 text-white"
                      : "text-ink-500 hover:bg-ink-100")
                  }
                >
                  <span className="text-[11px] opacity-70">{d}</span>
                  <span className="text-base">
                    {Number(fechaDia.split("-")[2])}
                  </span>
                </Link>
              );
            })}
          </div>
          <Link
            href={`/app/calendario?fecha=${diaSiguiente}`}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-50"
            aria-label="Día siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <NuevaCita
          fecha={agenda.fechaISO}
          servicios={servicios}
          clientes={clientes}
          deshabilitado={agenda.demo}
        />
      </div>

      <p className="mb-4 text-sm capitalize text-ink-400">
        {tituloFecha(agenda.fechaISO)}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Timeline */}
        <div className="rounded-3xl border border-ink-200/70 bg-white p-4 shadow-soft">
          <div className="relative" style={{ height: HORAS.length * PX_POR_HORA }}>
            {HORAS.map((h, i) => (
              <div
                key={h}
                className="absolute inset-x-0 flex items-start gap-3"
                style={{ top: i * PX_POR_HORA }}
              >
                <span className="w-12 shrink-0 pt-1 text-right text-xs tabular-nums text-ink-300">
                  {h}:00
                </span>
                <div className="mt-2.5 h-px flex-1 bg-ink-100" />
              </div>
            ))}

            {/* Citas posicionadas */}
            <div className="absolute inset-y-0 left-16 right-2">
              {agenda.citas.length === 0 && (
                <p className="pt-6 text-center text-sm text-ink-300">
                  No hay citas este día.
                </p>
              )}
              {agenda.citas.map((c) => (
                <CitaCard
                  key={c.id}
                  cita={c}
                  abierta={seleccionada === c.id}
                  onToggle={() =>
                    setSeleccionada((prev) => (prev === c.id ? null : c.id))
                  }
                  onCompletar={() => ejecutar(c.id, "completar")}
                  onFacturar={() => ejecutar(c.id, "facturar")}
                  pendiente={pendiente}
                  accionId={accionId}
                  feedback={feedback?.citaId === c.id ? feedback : null}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Panel lateral: resumen del día */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-ink-900">Resumen del día</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-ink-50 p-3">
                <p className="text-xl font-semibold text-ink-900">
                  {agenda.citas.length}
                </p>
                <p className="text-xs text-ink-400">Citas</p>
              </div>
              <div className="rounded-2xl bg-ink-50 p-3">
                <p className="text-xl font-semibold text-ink-900">
                  {formatMoney(previstoCents)}
                </p>
                <p className="text-xs text-ink-400">Previsto</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Clock className="h-4 w-4 text-ink-400" />
              Reserva rápida
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Elige un servicio para crear una cita.
            </p>
            <div className="mt-3 space-y-2">
              {servicios.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServicioRapido(s.id)}
                  disabled={agenda.demo}
                  className="flex w-full items-center justify-between rounded-2xl border border-ink-100 px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ink-100 disabled:hover:bg-transparent"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">{s.nombre}</p>
                    <p className="text-xs text-ink-400">{s.duracionMin} min</p>
                  </div>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatMoney(s.precioCents)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reserva rápida (servicio preseleccionado) */}
      {servicioRapido && (
        <NuevaCita
          variante="controlado"
          fecha={agenda.fechaISO}
          servicios={servicios}
          clientes={clientes}
          servicioInicialId={servicioRapido}
          onDone={() => setServicioRapido(null)}
        />
      )}
    </div>
  );
}

function CitaCard({
  cita,
  abierta,
  onToggle,
  onCompletar,
  onFacturar,
  pendiente,
  accionId,
  feedback,
}: {
  cita: CitaAgenda;
  abierta: boolean;
  onToggle: () => void;
  onCompletar: () => void;
  onFacturar: () => void;
  pendiente: boolean;
  accionId: string | null;
  feedback: Feedback | null;
}) {
  const top = topDeHora(cita.horaInicio);
  const alto = altoDeCita(cita.horaInicio, cita.horaFin);
  const completandoEste = accionId === `${cita.id}:completar`;
  const facturandoEste = accionId === `${cita.id}:facturar`;

  return (
    <div
      className="absolute left-0 right-0"
      style={{ top }}
    >
      <button
        onClick={onToggle}
        className="w-full overflow-hidden rounded-2xl border border-ink-100 bg-white p-3 text-left shadow-soft transition-shadow hover:shadow-card"
        style={{ minHeight: alto }}
      >
        <div className="flex items-center gap-2">
          <span className="h-6 w-1 rounded-full bg-brand-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">
              {cita.clienteNombre}
            </p>
            <p className="truncate text-xs text-ink-400">
              {cita.horaInicio} · {cita.servicioNombre} ·{" "}
              {formatMoney(cita.precioCents)}
            </p>
          </div>
          <EstadoBadge estado={cita.estado} />
        </div>
      </button>

      {abierta && (
        <div className="mt-1 rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
          {cita.facturada ? (
            <p className="text-xs text-ink-400">
              Esta cita ya está facturada.
            </p>
          ) : cita.completable ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onCompletar}
                disabled={pendiente}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
              >
                {completandoEste ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Completar
              </button>
              <button
                onClick={onFacturar}
                disabled={pendiente}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-800 disabled:opacity-50"
              >
                {facturandoEste ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Completar y facturar
              </button>
            </div>
          ) : (
            <p className="text-xs text-ink-400">
              Esta cita no admite acciones.
            </p>
          )}

          {feedback && (
            <div className="mt-2 text-xs">
              <p className={feedback.ok ? "text-accent-700" : "text-red-600"}>
                {feedback.mensaje}
              </p>
              {feedback.facturaId && (
                <Link
                  href={`/app/facturacion/${feedback.facturaId}`}
                  className="mt-1 inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  Ver factura
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
