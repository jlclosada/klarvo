import { GestionCita } from "@/components/reservar/gestion-cita";
import { Logo } from "@/components/ui/logo";
import { getCitaPorToken } from "@/lib/db/cita-gestion";
import { formatDate, formatMoney, formatTime } from "@/lib/utils";
import {
    CalendarCheck,
    CheckCircle2,
    Clock,
    CreditCard,
    XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Tu reserva · Klarvo",
  robots: { index: false },
};

const ESTADO_LABEL: Record<string, { texto: string; clase: string }> = {
  CONFIRMADA: { texto: "Confirmada", clase: "bg-accent-500/10 text-accent-700" },
  PENDIENTE_PAGO: {
    texto: "Pendiente de pago",
    clase: "bg-amber-400/15 text-amber-700",
  },
  RECORDADA: { texto: "Confirmada", clase: "bg-accent-500/10 text-accent-700" },
  COMPLETADA: { texto: "Completada", clase: "bg-ink-200 text-ink-600" },
  FACTURADA: { texto: "Completada", clase: "bg-ink-200 text-ink-600" },
  CANCELADA_CLIENTE: {
    texto: "Cancelada",
    clase: "bg-red-100 text-red-600",
  },
  CANCELADA_NEGOCIO: {
    texto: "Cancelada",
    clase: "bg-red-100 text-red-600",
  },
  NO_SHOW: { texto: "No asistida", clase: "bg-red-100 text-red-600" },
};

export default async function CitaPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { token } = await params;
  const { pago } = await searchParams;
  const cita = await getCitaPorToken(token);
  if (!cita) notFound();

  const estado = ESTADO_LABEL[cita.estado] ?? {
    texto: cita.estado,
    clase: "bg-ink-200 text-ink-600",
  };
  const cancelada = cita.estado.startsWith("CANCELADA");

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50/40 px-4 py-12">
      <div className="w-full max-w-md">
        {pago === "ok" && cita.estado === "CONFIRMADA" && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-medium text-accent-700">
            <CheckCircle2 className="h-4 w-4" />
            ¡Pago recibido! Tu reserva está confirmada.
          </div>
        )}

        <div className="rounded-3xl border border-ink-200 bg-white p-7 shadow-card">
          <div className="flex items-center justify-between">
            <div
              className={`grid h-12 w-12 place-items-center rounded-2xl ${
                cancelada
                  ? "bg-red-100 text-red-500"
                  : "bg-accent-500/10 text-accent-600"
              }`}
            >
              {cancelada ? (
                <XCircle className="h-6 w-6" />
              ) : (
                <CalendarCheck className="h-6 w-6" />
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}
            >
              {estado.texto}
            </span>
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink-900">
            {cita.servicioNombre}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            en {cita.negocioNombre}
          </p>

          <dl className="mt-6 space-y-3 border-y border-ink-100 py-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-ink-400">
                <CalendarCheck className="h-4 w-4" />
                Fecha
              </dt>
              <dd className="font-medium text-ink-900">
                {formatDate(cita.inicioISO, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-ink-400">
                <Clock className="h-4 w-4" />
                Hora
              </dt>
              <dd className="font-medium text-ink-900">
                {formatTime(cita.inicioISO)}
              </dd>
            </div>
            {cita.depositoCents > 0 && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-ink-400">
                  <CreditCard className="h-4 w-4" />
                  Depósito
                </dt>
                <dd className="font-medium text-ink-900">
                  {formatMoney(cita.depositoCents)}{" "}
                  <span className="text-xs text-ink-400">
                    {cita.depositoPagado ? "· pagado" : "· pendiente"}
                  </span>
                </dd>
              </div>
            )}
          </dl>

          {cancelada ? (
            <p className="mt-6 rounded-2xl bg-ink-50 px-4 py-3 text-center text-sm text-ink-500">
              Esta reserva fue cancelada.
            </p>
          ) : (
            <GestionCita token={token} puedeCancelar={cita.puedeCancelar} />
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
          <Logo href="/" compact />
          <p className="text-xs text-ink-400">
            Gestionado con Klarvo · Tus datos protegidos (RGPD)
          </p>
        </div>
      </div>
    </div>
  );
}
