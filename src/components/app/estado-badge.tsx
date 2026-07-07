import type { EstadoCita } from "@/lib/config";
import { cn } from "@/lib/utils";

const META: Record<EstadoCita, { label: string; className: string }> = {
  BORRADOR: { label: "Borrador", className: "bg-ink-100 text-ink-500" },
  PENDIENTE_PAGO: { label: "Pendiente pago", className: "bg-amber-400/15 text-amber-700" },
  CONFIRMADA: { label: "Confirmada", className: "bg-accent-500/10 text-accent-700" },
  RECORDADA: { label: "Recordada", className: "bg-brand-500/10 text-brand-700" },
  COMPLETADA: { label: "Completada", className: "bg-ink-900/5 text-ink-600" },
  FACTURADA: { label: "Facturada", className: "bg-brand-500/10 text-brand-700" },
  CANCELADA_CLIENTE: { label: "Cancelada", className: "bg-red-500/10 text-red-600" },
  CANCELADA_NEGOCIO: { label: "Cancelada", className: "bg-red-500/10 text-red-600" },
  NO_SHOW: { label: "No-show", className: "bg-red-500/10 text-red-600" },
};

export function EstadoBadge({ estado }: { estado: EstadoCita }) {
  const m = META[estado];
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-[10px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}
