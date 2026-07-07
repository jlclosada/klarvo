"use client";

import type { ServicioPublico } from "@/lib/db/reservas-publicas";
import { crearReserva, huecosDeServicio } from "@/lib/reservas/actions";
import { calcularDeposito } from "@/lib/reservas/disponibilidad";
import { cn, formatMoney } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    CalendarCheck,
    Check,
    ChevronLeft,
    Clock,
    CreditCard,
    Loader2,
    ShieldCheck
} from "lucide-react";
import { useState, useTransition } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Paso = 1 | 2 | 3 | 4;

interface BookingFlowProps {
  negocioSlug: string;
  negocioNombre: string;
  servicios: ServicioPublico[];
  huecosIniciales: string[];
}

/** Convierte "HH:mm" de hoy en un ISO 8601 con la fecha actual. */
function horaAIso(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function BookingFlow({
  negocioSlug,
  negocioNombre,
  servicios,
  huecosIniciales,
}: BookingFlowProps) {
  const [paso, setPaso] = useState<Paso>(1);
  const [servicio, setServicio] = useState<ServicioPublico | null>(null);
  const [huecos, setHuecos] = useState<string[]>(huecosIniciales);
  const [cargandoHuecos, setCargandoHuecos] = useState(false);
  const [hueco, setHueco] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "" });
  const [error, setError] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  const deposito = servicio
    ? calcularDeposito(
        servicio.precioCents,
        servicio.depositoTipo,
        servicio.depositoValor,
      )
    : 0;

  const pasos = ["Servicio", "Hora", "Tus datos", "Confirmación"];

  async function seleccionarServicio(s: ServicioPublico) {
    setServicio(s);
    setPaso(2);
    setCargandoHuecos(true);
    try {
      const nuevos = await huecosDeServicio(negocioSlug, s.id);
      setHuecos(nuevos);
    } catch {
      setHuecos([]);
    } finally {
      setCargandoHuecos(false);
    }
  }

  function confirmar() {
    if (!servicio || !hueco) return;
    setError(null);
    startTransition(async () => {
      const res = await crearReserva({
        negocioSlug,
        servicioId: servicio.id,
        inicioISO: horaAIso(hueco),
        cliente: datos,
        consentimientoRgpd: consent,
      });

      if (!res.ok) {
        setError(res.error ?? "No se pudo completar la reserva.");
        return;
      }
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      if (res.tokenGestion) {
        window.location.href = `/cita/${res.tokenGestion}?pago=ok`;
      }
    });
  }


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
        {/* Paso 1: servicio */}
        {paso === 1 && (
          <Step key="s1">
            <h2 className="text-xl font-semibold text-ink-900">Elige un servicio</h2>
            {servicios.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-ink-50 p-4 text-sm text-ink-500">
                Este negocio aún no tiene servicios disponibles para reservar.
              </p>
            ) : (
              <div className="mt-5 space-y-2.5">
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => seleccionarServicio(s)}
                    className="flex w-full items-center justify-between rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-900">{s.nombre}</p>
                      <p className="flex items-center gap-1.5 text-xs text-ink-400">
                        <Clock className="h-3 w-3" />
                        {s.duracionMin} min
                      </p>
                    </div>
                    <span className="text-base font-semibold text-ink-900">
                      {formatMoney(s.precioCents)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Step>
        )}

        {/* Paso 2: hueco */}
        {paso === 2 && servicio && (
          <Step key="s2">
            <BackBtn onClick={() => setPaso(1)} />
            <h2 className="mt-2 text-xl font-semibold text-ink-900">Elige una hora</h2>
            <p className="mt-1 text-sm text-ink-400">
              {servicio.nombre} · hoy
            </p>
            {cargandoHuecos ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-ink-300" />
              </div>
            ) : huecos.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-ink-50 p-4 text-sm text-ink-500">
                No quedan huecos disponibles hoy. Prueba otro día.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {huecos.map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setHueco(h);
                      setPaso(3);
                    }}
                    className="rounded-2xl border border-ink-200 bg-white py-3 text-sm font-medium text-ink-800 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-700 hover:shadow-soft"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </Step>
        )}

        {/* Paso 3: datos */}
        {paso === 3 && servicio && (
          <Step key="s3">
            <BackBtn onClick={() => setPaso(2)} />
            <h2 className="mt-2 text-xl font-semibold text-ink-900">Tus datos</h2>
            <div className="mt-5 space-y-3">
              <input
                placeholder="Nombre y apellidos"
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              />
              <input
                type="email"
                placeholder="Email"
                value={datos.email}
                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={datos.telefono}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              />

              <label className="flex items-start gap-2.5 rounded-2xl bg-ink-50 p-3 text-xs text-ink-500">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <span>
                  Acepto que {negocioNombre} trate mis datos para gestionar esta
                  reserva, conforme a su política de privacidad. (RGPD)
                </span>
              </label>

              <button
                disabled={!consent || !datos.nombre || !datos.email}
                onClick={() => setPaso(4)}
                className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar al pago
              </button>
            </div>
          </Step>
        )}

        {/* Paso 4: confirmación / depósito */}
        {paso === 4 && servicio && hueco && (
          <Step key="s4">
            <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-card">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-500/10 text-accent-600">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-center text-xl font-semibold text-ink-900">
                Casi listo, {datos.nombre.split(" ")[0] || "¡genial!"}
              </h2>
              <p className="mt-1 text-center text-sm text-ink-400">
                Revisa y confirma tu reserva
              </p>

              <dl className="mt-6 space-y-3 border-y border-ink-100 py-5 text-sm">
                <Row k="Servicio" v={servicio.nombre} />
                <Row k="Duración" v={`${servicio.duracionMin} min`} />
                <Row k="Hora" v={`Hoy · ${hueco}`} />
                <Row k="Precio" v={formatMoney(servicio.precioCents)} />
              </dl>

              {deposito > 0 ? (
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-brand-700">
                    <CreditCard className="h-4 w-4" />
                    Depósito ahora
                  </span>
                  <span className="text-base font-semibold text-brand-700">
                    {formatMoney(deposito)}
                  </span>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-ink-50 px-4 py-3 text-center text-sm text-ink-500">
                  Sin depósito. Pagas en el establecimiento.
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                onClick={confirmar}
                disabled={enviando}
                className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                {deposito > 0 ? `Pagar ${formatMoney(deposito)} y reservar` : "Confirmar reserva"}
              </button>
              <button
                onClick={() => setPaso(3)}
                disabled={enviando}
                className="mt-2 w-full text-center text-xs font-medium text-ink-400 hover:text-ink-700"
              >
                Volver
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-600" />
                Pago seguro con Stripe · Cancelación gratuita hasta 24 h antes
              </p>
            </div>
          </Step>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"
    >
      <ChevronLeft className="h-4 w-4" />
      Atrás
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-400">{k}</dt>
      <dd className="font-medium text-ink-900">{v}</dd>
    </div>
  );
}
