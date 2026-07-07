import { Bell, CalendarCheck, CreditCard } from "lucide-react";

/**
 * Mockup de la app mostrado en el hero. Estático (server component) pero con
 * detalles realistas: agenda del día, tarjeta de depósito y recordatorio.
 */
export function AppPreview() {
  const citas = [
    { h: "09:30", n: "Lucía M.", s: "Corte + peinado", c: "bg-brand-500", estado: "Confirmada" },
    { h: "11:00", n: "Carlos R.", s: "Barba premium", c: "bg-accent-500", estado: "Depósito 8€" },
    { h: "12:30", n: "Ana G.", s: "Manicura semi", c: "bg-amber-400", estado: "Confirmada" },
    { h: "16:00", n: "Nuevo hueco", s: "Disponible", c: "bg-ink-200", estado: "Libre" },
  ];

  return (
    <div className="relative w-full max-w-md">
      {/* Ventana principal */}
      <div className="overflow-hidden rounded-[26px] border border-ink-200/70 bg-white shadow-card">
        <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50/70 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs font-medium text-ink-400">
            klarvo.es/app/calendario
          </span>
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-brand-600">Hoy · Lunes</p>
              <p className="text-sm font-semibold text-ink-900">Agenda de Martina</p>
            </div>
            <span className="chip">3 citas · 1 hueco</span>
          </div>

          <div className="space-y-2">
            {citas.map((c) => (
              <div
                key={c.h}
                className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-3 py-2.5"
              >
                <span className="w-10 text-xs font-semibold tabular-nums text-ink-500">
                  {c.h}
                </span>
                <span className={`h-8 w-1 rounded-full ${c.c}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{c.n}</p>
                  <p className="truncate text-xs text-ink-400">{c.s}</p>
                </div>
                <span className="rounded-full bg-ink-50 px-2 py-1 text-[10px] font-medium text-ink-500">
                  {c.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjeta flotante: depósito cobrado */}
      <div className="absolute -left-6 bottom-8 hidden animate-float rounded-2xl border border-ink-100 bg-white p-3 shadow-glow sm:block">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-500/10 text-accent-600">
            <CreditCard className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-900">Depósito cobrado</p>
            <p className="text-[11px] text-ink-400">−90% no-shows</p>
          </div>
        </div>
      </div>

      {/* Tarjeta flotante: recordatorio */}
      <div
        className="absolute -right-4 -top-5 hidden animate-float rounded-2xl border border-ink-100 bg-white p-3 shadow-glow sm:block"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
            <Bell className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-900">Recordatorio enviado</p>
            <p className="text-[11px] text-ink-400">24 h antes</p>
          </div>
        </div>
      </div>

      {/* Badge inferior */}
      <div className="absolute -bottom-5 right-6 hidden items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1.5 shadow-soft md:flex">
        <CalendarCheck className="h-3.5 w-3.5 text-accent-600" />
        <span className="text-[11px] font-medium text-ink-600">Factura lista para VeriFactu</span>
      </div>
    </div>
  );
}
