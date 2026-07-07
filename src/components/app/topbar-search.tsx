"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Buscador del panel. Envía la consulta a la página de clientes con ?q=…, que
 * la usa para filtrar la lista.
 */
export function TopbarSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/app/clientes?q=${encodeURIComponent(term)}` : "/app/clientes");
  }

  return (
    <form onSubmit={buscar} className="relative hidden sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar clientes…"
        className="w-44 rounded-full border border-ink-200 bg-ink-50/60 py-2 pl-9 pr-3 text-sm outline-none transition focus:w-56 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
      />
    </form>
  );
}
