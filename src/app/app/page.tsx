import { EstadoBadge } from "@/components/app/estado-badge";
import { Topbar } from "@/components/app/topbar";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
    getCitasHoy,
    getFacturas,
    getMetricas,
    getMiNegocio,
    getResumenOnboarding,
} from "@/lib/db/panel";
import { formatMoney } from "@/lib/utils";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Percent,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserPlus,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [m, negocio, citasHoy, facturas, onboarding] = await Promise.all([
    getMetricas(),
    getMiNegocio(),
    getCitasHoy(),
    getFacturas(),
    getResumenOnboarding(),
  ]);

  const delta = Math.round(
    ((m.ingresosMesCents - m.ingresosMesAnteriorCents) /
      m.ingresosMesAnteriorCents) *
      100,
  );
  const maxSerie = Math.max(...m.serie, 1);
  const nombreNegocio = negocio?.nombre ?? "tu negocio";

  const stats = [
    {
      label: "Ingresos del mes",
      value: formatMoney(m.ingresosMesCents),
      delta: `${delta >= 0 ? "+" : ""}${delta}%`,
      icon: TrendingUp,
      up: delta >= 0,
    },
    {
      label: "Citas del mes",
      value: String(m.citasMes),
      delta: "",
      icon: CalendarDays,
      up: true,
    },
    {
      label: "Tasa de no-show",
      value: `${m.tasaNoShow}%`,
      delta: "",
      icon: Percent,
      up: true,
    },
    {
      label: "Clientes nuevos",
      value: String(m.clientesNuevos),
      delta: "",
      icon: UserPlus,
      up: true,
    },
  ];

  return (
    <>
      <Topbar
        title={`Hola, ${nombreNegocio}`}
        subtitle="Este es el resumen de tu negocio hoy"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Aviso de configuración inicial pendiente */}
        {onboarding && !onboarding.completo && (
          <Link
            href="/app/onboarding"
            className="flex items-center gap-4 rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">
                Termina de configurar tu negocio
              </p>
              <p className="text-sm text-ink-500">
                Añade tus servicios y tu horario para empezar a recibir reservas.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-brand-600" />
          </Link>
        )}

        {/* KPIs */}
        <RevealGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <RevealItem key={s.label}>
              <div className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-50 text-ink-700">
                    <s.icon className="h-5 w-5" />
                  </span>
                  {s.delta && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-700">
                      <ArrowUpRight className="h-3 w-3" />
                      {s.delta}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">
                  {s.value}
                </p>
                <p className="text-sm text-ink-400">{s.label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Gráfico ingresos */}
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink-900">
                  Ingresos por semana
                </h2>
                <p className="text-sm text-ink-400">Últimas 7 semanas</p>
              </div>
              <span className="chip">Ocupación {m.ocupacion}%</span>
            </div>

            <div className="mt-8 flex h-48 items-end gap-3">
              {m.serie.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 hover:from-brand-600 hover:to-brand-500"
                      style={{ height: `${(v / maxSerie) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-400">S{i + 1}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Agenda de hoy */}
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Agenda de hoy</h2>
              <Link
                href="/app/calendario"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todo
              </Link>
            </div>
            {citasHoy.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-400">
                No hay citas para hoy.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {citasHoy.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-2xl border border-ink-100 px-3 py-2.5"
                  >
                    <span className="w-11 text-xs font-semibold tabular-nums text-ink-500">
                      {c.hora}
                    </span>
                    <span className={`h-8 w-1 rounded-full ${c.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {c.clienteNombre}
                      </p>
                      <p className="truncate text-xs text-ink-400">
                        {c.servicioNombre}
                      </p>
                    </div>
                    <EstadoBadge estado={c.estado} />
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>

        {/* Facturas recientes + banner VeriFactu */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">
                Facturas recientes
              </h2>
              <Link
                href="/app/facturacion"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver todas
              </Link>
            </div>
            {facturas.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-400">
                Todavía no hay facturas emitidas.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50/60 text-left text-xs text-ink-400">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Número</th>
                      <th className="px-4 py-2.5 font-medium">Total</th>
                      <th className="px-4 py-2.5 font-medium">Huella</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {facturas.slice(0, 4).map((f) => (
                      <tr key={f.id} className="hover:bg-ink-50/40">
                        <td className="px-4 py-2.5 font-medium text-ink-900">
                          {f.serie}-{f.numero}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-900">
                          {formatMoney(f.totalCents)}
                        </td>
                        <td className="px-4 py-2.5">
                          <code className="rounded bg-ink-50 px-1.5 py-0.5 font-mono text-xs text-ink-500">
                            {f.hash}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Reveal>

          <Reveal className="flex flex-col justify-between rounded-3xl border border-ink-200/70 bg-ink-900 p-6 text-white shadow-soft">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">Listo para VeriFactu</h2>
              <p className="mt-2 text-sm text-white/70">
                Tus facturas ya se generan con registro inalterable y encadenado.
                Cuando sea obligatorio, lo activas con un clic.
              </p>
            </div>
            <Link
              href="/app/ajustes"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5"
            >
              Configurar facturación
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </>
  );
}
