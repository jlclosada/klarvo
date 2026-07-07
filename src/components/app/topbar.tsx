import { TopbarSearch } from "@/components/app/topbar-search";
import { Plus } from "lucide-react";
import Link from "next/link";

/** Barra superior del panel con acción principal y búsqueda. */
export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-ink-200/60 bg-white/80 px-6 py-4 backdrop-blur-xl">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-ink-900">
          {title}
        </h1>
        {subtitle && <p className="truncate text-sm text-ink-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <TopbarSearch />
        <Link href="/app/calendario" className="btn-primary">
          <Plus className="h-4 w-4" />
          Nueva cita
        </Link>
      </div>
    </header>
  );
}
