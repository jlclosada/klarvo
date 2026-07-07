import { NuevoCliente } from "@/components/app/nuevo-cliente";
import { Topbar } from "@/components/app/topbar";
import { Reveal } from "@/components/motion/reveal";
import { getClientes, getMiNegocio } from "@/lib/db/panel";
import { formatDate } from "@/lib/utils";
import { Mail, Phone } from "lucide-react";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, todos, negocio] = await Promise.all([
    searchParams,
    getClientes(),
    getMiNegocio(),
  ]);
  const demo = negocio?.demo ?? true;

  const termino = (q ?? "").trim().toLowerCase();
  const clientes = termino
    ? todos.filter(
        (c) =>
          c.nombre.toLowerCase().includes(termino) ||
          c.email.toLowerCase().includes(termino) ||
          c.telefono.toLowerCase().includes(termino),
      )
    : todos;

  return (
    <>
      <Topbar title="Clientes" subtitle="Tu base de clientes y su historial" />

      <div className="flex-1 p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {termino
              ? `${clientes.length} resultado${clientes.length === 1 ? "" : "s"} para “${q}”`
              : `${clientes.length} clientes`}
          </p>
          <NuevoCliente deshabilitado={demo} />
        </div>

        {clientes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50/40 p-12 text-center">
            <p className="text-sm text-ink-500">
              {termino
                ? "Ningún cliente coincide con la búsqueda."
                : "Todavía no hay clientes. Se añadirán solos con cada reserva, o puedes crearlos manualmente."}
            </p>
          </div>
        ) : (
          <Reveal className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-xs text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Contacto</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Alta</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Etiquetas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {clientes.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-ink-50/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">
                          {iniciales(c.nombre)}
                        </span>
                        <div>
                          <p className="font-medium text-ink-900">{c.nombre}</p>
                          <p className="text-xs text-ink-400 sm:hidden">{c.telefono}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      <div className="space-y-0.5 text-xs text-ink-500">
                        {c.telefono && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            {c.telefono}
                          </p>
                        )}
                        {c.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 text-ink-500 md:table-cell">
                      {formatDate(c.creadoISO)}
                    </td>
                    <td className="hidden px-5 py-3.5 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.etiquetas.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        )}
      </div>
    </>
  );
}
