"use client";

import { formatMoney } from "@/lib/utils";
import { Download } from "lucide-react";

interface FacturaExport {
  serie: string;
  numero: number;
  fechaISO: string;
  totalCents: number;
  hash: string;
}

/**
 * Exporta las facturas visibles a un CSV descargable (sin dependencias).
 * Se genera en el navegador a partir de los datos ya cargados.
 */
export function ExportarFacturas({ facturas }: { facturas: FacturaExport[] }) {
  function exportar() {
    const cabecera = ["Numero", "Fecha", "Total (EUR)", "Huella"];
    const filas = facturas.map((f) => [
      `${f.serie}-${f.numero}`,
      f.fechaISO.slice(0, 10),
      formatMoney(f.totalCents).replace(/\s/g, " "),
      f.hash,
    ]);

    const csv = [cabecera, ...filas]
      .map((fila) =>
        fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportar}
      disabled={facturas.length === 0}
      className="btn-outline disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Exportar
    </button>
  );
}
