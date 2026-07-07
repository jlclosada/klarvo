import { NuevoServicio } from "@/components/app/nuevo-servicio";
import { ServicioMenu } from "@/components/app/servicio-menu";
import { Topbar } from "@/components/app/topbar";
import { Reveal } from "@/components/motion/reveal";
import { getMiNegocio, getServicios } from "@/lib/db/panel";
import { formatMoney } from "@/lib/utils";
import { Clock } from "lucide-react";

function depositoLabel(
  tipo: "porcentaje" | "fijo" | "ninguno",
  valor: number,
  precioCents: number,
) {
  if (tipo === "ninguno") return "Sin depósito";
  if (tipo === "fijo") return `${formatMoney(valor)} depósito`;
  return `${valor}% (${formatMoney((precioCents * valor) / 100)})`;
}

export default async function ServiciosPage() {
  const [servicios, negocio] = await Promise.all([
    getServicios(),
    getMiNegocio(),
  ]);
  const demo = negocio?.demo ?? true;
  const activos = servicios.filter((s) => s.activo).length;

  return (
    <>
      <Topbar title="Servicios" subtitle="Tus servicios, precios y depósitos" />

      <div className="flex-1 p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {activos} activos · {servicios.length} en total
          </p>
          <NuevoServicio deshabilitado={demo} />
        </div>

        {servicios.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50/40 p-12 text-center">
            <p className="text-sm text-ink-500">
              Aún no tienes servicios. Crea el primero para empezar a recibir
              reservas.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servicios.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <div className="group relative rounded-3xl border border-ink-200/70 bg-white p-5 shadow-soft transition-transform hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-ink-900">
                        {s.nombre}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
                        <Clock className="h-3.5 w-3.5" />
                        {s.duracionMin} min
                      </p>
                    </div>
                    <ServicioMenu
                      id={s.id}
                      activo={s.activo}
                      deshabilitado={demo}
                    />
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <span className="text-2xl font-semibold tracking-tight text-ink-900">
                      {formatMoney(s.precioCents)}
                    </span>
                    {s.activo ? (
                      <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-700">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">
                        Pausado
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-500">
                    {depositoLabel(s.depositoTipo, s.depositoValor, s.precioCents)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
