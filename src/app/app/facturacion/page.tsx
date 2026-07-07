import { ExportarFacturas } from "@/components/app/exportar-facturas";
import { Topbar } from "@/components/app/topbar";
import { Reveal } from "@/components/motion/reveal";
import { getFacturas } from "@/lib/db/panel";
import { formatDate, formatMoney } from "@/lib/utils";
import { QrCode, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function FacturacionPage() {
  const facturas = await getFacturas();
  const total = facturas.reduce((a, f) => a + f.totalCents, 0);

  return (
    <>
      <Topbar title="Facturación" subtitle="Facturas encadenadas y listas para VeriFactu" />

      <div className="flex-1 space-y-6 p-6">
        {/* Banner integridad */}
        <Reveal className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-ink-200/70 bg-ink-900 p-6 text-white shadow-soft sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Cadena de integridad verificada</h2>
              <p className="text-sm text-white/60">
                Todas tus facturas están encadenadas con huella criptográfica.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-3 py-1.5 text-sm font-medium text-accent-100">
            <QrCode className="h-4 w-4" />
            QR verificable
          </span>
        </Reveal>

        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-400">Facturado (histórico)</p>
            <p className="text-2xl font-semibold tracking-tight text-ink-900">
              {formatMoney(total)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportarFacturas facturas={facturas} />
          </div>
        </div>

        {facturas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50/40 p-12 text-center">
            <p className="text-sm text-ink-500">
              Aún no hay facturas. Se generan automáticamente al completar una
              cita.
            </p>
          </div>
        ) : (
          <Reveal className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-xs text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Número</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Fecha</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Huella</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {facturas.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-ink-50/40">
                    <td className="px-5 py-3.5 font-medium text-ink-900">
                      <Link
                        href={`/app/facturacion/${f.id}`}
                        className="text-brand-700 hover:underline"
                      >
                        {f.serie}-{f.numero}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3.5 text-ink-500 sm:table-cell">
                      {formatDate(f.fechaISO)}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums font-medium text-ink-900">
                      {formatMoney(f.totalCents)}
                    </td>
                    <td className="hidden px-5 py-3.5 md:table-cell">
                      <code className="rounded bg-ink-50 px-1.5 py-0.5 font-mono text-xs text-ink-500">
                        {f.hash}
                      </code>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/app/facturacion/${f.id}`}
                        className="rounded-full bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-700 hover:bg-accent-500/20"
                      >
                        Ver
                      </Link>
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
