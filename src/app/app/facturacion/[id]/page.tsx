import { Topbar } from "@/components/app/topbar";
import { getFacturaDetalle } from "@/lib/db/panel";
import { hasSupabase } from "@/lib/env";
import { formatDate, formatMoney } from "@/lib/utils";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

export const metadata: Metadata = {
  title: "Factura",
  robots: { index: false, follow: false },
};

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // En modo demo no hay facturas reales que mostrar.
  if (!hasSupabase()) notFound();

  const factura = await getFacturaDetalle(id);
  if (!factura) notFound();

  // QR verificable (SVG). Codifica el contenido almacenado al emitir.
  const qrSvg = factura.qr
    ? await QRCode.toString(factura.qr, {
        type: "svg",
        margin: 1,
        width: 160,
      })
    : null;

  return (
    <>
      <Topbar title={`Factura ${factura.serie}-${factura.numero}`} subtitle="Detalle y verificación" />

      <div className="flex-1 p-6">
        <Link
          href="/app/facturacion"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a facturación
        </Link>

        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-ink-200/70 bg-white shadow-soft">
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Factura simplificada
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-ink-900">
                {factura.serie}-{factura.numero}
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                {formatDate(factura.fechaISO)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink-900">
                {factura.negocioNombre}
              </p>
              {factura.nifEmisor && (
                <p className="text-xs text-ink-400">NIF {factura.nifEmisor}</p>
              )}
            </div>
          </div>

          {/* Concepto */}
          <div className="p-6">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 text-left text-xs text-ink-400">
                <tr>
                  <th className="pb-2 font-medium">Concepto</th>
                  <th className="pb-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 text-ink-900">
                    {factura.servicioNombre ?? "Servicio"}
                    {factura.clienteNombre && (
                      <span className="block text-xs text-ink-400">
                        Cliente: {factura.clienteNombre}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right tabular-nums text-ink-900">
                    {formatMoney(factura.baseCents)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
              <Fila label="Base imponible" value={formatMoney(factura.baseCents)} />
              <Fila label="IVA (21%)" value={formatMoney(factura.ivaCents)} />
              <div className="flex items-center justify-between pt-2 text-base font-semibold text-ink-900">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(factura.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Verificación / QR */}
          <div className="flex flex-col gap-5 border-t border-ink-100 bg-ink-50/40 p-6 sm:flex-row sm:items-center">
            {qrSvg && (
              <div
                className="h-40 w-40 shrink-0 rounded-2xl border border-ink-100 bg-white p-2"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Registro encadenado
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Esta factura está encadenada con huella criptográfica a la
                anterior de la serie, garantizando su integridad (preparado para
                VeriFactu).
              </p>
              <dl className="mt-3 space-y-1.5">
                <Huella label="Huella actual" value={factura.hashActual} />
                <Huella label="Huella anterior" value={factura.hashAnterior} />
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-500">
      <span>{label}</span>
      <span className="tabular-nums text-ink-700">{value}</span>
    </div>
  );
}

function Huella({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink-400">{label}</dt>
      <dd>
        <code className="block break-all font-mono text-[11px] text-ink-600">
          {value}
        </code>
      </dd>
    </div>
  );
}
