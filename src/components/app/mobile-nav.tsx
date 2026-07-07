"use client";

import { cn } from "@/lib/utils";
import { CalendarDays, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/app/calendario", label: "Agenda", icon: CalendarDays },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/facturacion", label: "Facturas", icon: FileText },
  { href: "/app/ajustes", label: "Ajustes", icon: Settings },
];

/** Navegación inferior para móvil. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-ink-200/60 bg-white/90 px-2 py-2 backdrop-blur-xl lg:hidden">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
              active ? "text-brand-600" : "text-ink-400",
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
