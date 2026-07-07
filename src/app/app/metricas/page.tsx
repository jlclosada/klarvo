import { Topbar } from "@/components/app/topbar";
import { Reveal } from "@/components/motion/reveal";
import { getMetricas } from "@/lib/db/panel";
import { formatMoney } from "@/lib/utils";
import { Percent, Repeat, TrendingUp, Users } from "lucide-react";

export default async function MetricasPage() {
  const m = await getMetricas();
  const maxSerie = Math.max(...m.serie, 1);
  const totalClientes = m.clientesNuevos + m.clientesRecurrentes;
  const pctRecurrentes = totalClientes
    ? Math.round((m.clientesRecurrentes / totalClientes) * 100)
    : 0;

  const cards = [
    { label: "Ingresos del mes", value: formatMoney(m.ingresosMesCents), icon: TrendingUp },
    { label: "Ocupación media", value: `${m.ocupacion}%`, icon: Percent },
    { label: "Clientes recurrentes", value: `${pctRecurrentes}%`, icon: Repeat },
    { label: "Clientes nuevos", value: String(m.clientesNuevos), icon: Users },
  ];

  return (
    <>
      <Topbar title="Métricas" subtitle="Cómo evoluciona tu negocio" />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <div className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-soft">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-50 text-ink-700">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">
                  {c.value}
                </p>
                <p className="text-sm text-ink-400">{c.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <h2 className="text-base font-semibold text-ink-900">Ingresos semanales</h2>
            <div className="mt-8 flex h-56 items-end gap-3">
              {m.serie.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-brand-500 to-brand-400"
                      style={{ height: `${(v / maxSerie) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-400">S{i + 1}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <h2 className="text-base font-semibold text-ink-900">Nuevos vs recurrentes</h2>
            <div className="mt-6 flex items-center justify-center">
              <div
                className="relative grid h-40 w-40 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#3366ff ${pctRecurrentes}%, #eceef2 0)`,
                }}
              >
                <div className="grid h-28 w-28 place-items-center rounded-full bg-white">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-ink-900">
                      {pctRecurrentes}%
                    </p>
                    <p className="text-[11px] text-ink-400">recurrentes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  Recurrentes
                </span>
                <span className="font-medium text-ink-900">{m.clientesRecurrentes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
                  Nuevos
                </span>
                <span className="font-medium text-ink-900">{m.clientesNuevos}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
