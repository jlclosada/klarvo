"use client";

import { LogoutButton } from "@/components/app/logout-button";
import { Logo } from "@/components/ui/logo";
import { mockNegocio } from "@/lib/mock";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    CalendarDays,
    FileText,
    LayoutDashboard,
    Scissors,
    Settings,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/app/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/app/servicios", label: "Servicios", icon: Scissors },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/facturacion", label: "Facturación", icon: FileText },
  { href: "/app/metricas", label: "Métricas", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200/60 bg-ink-50/40 p-4 lg:flex">
      <div className="px-2 py-2">
        <Logo href="/app" />
      </div>

      <div className="mt-4 rounded-2xl border border-ink-200/60 bg-white p-3 shadow-soft">
        <p className="text-sm font-semibold text-ink-900">{mockNegocio.nombre}</p>
        <p className="text-xs text-ink-400">{mockNegocio.vertical}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-700">
          Plan {mockNegocio.plan}
        </span>
      </div>

      <nav className="mt-4 flex-1 space-y-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-ink-900 text-white shadow-soft"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              <item.icon className="h-4.5 w-4.5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-ink-200/60 pt-3">
        <Link
          href="/app/ajustes"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/app/ajustes")
              ? "bg-ink-900 text-white"
              : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
          )}
        >
          <Settings className="h-4.5 w-4.5" />
          Ajustes
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
