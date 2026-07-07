"use client";

import { alternarServicio } from "@/lib/servicios/actions";
import { Loader2, MoreHorizontal, Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Menú contextual de un servicio: permite pausar o reactivar (usa la acción
 * `alternarServicio`). Deshabilitado en modo demo.
 */
export function ServicioMenu({
  id,
  activo,
  deshabilitado,
}: {
  id: string;
  activo: boolean;
  deshabilitado?: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  function alternar() {
    setAbierto(false);
    startTransition(async () => {
      await alternarServicio(id, !activo);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        disabled={deshabilitado || pendiente}
        aria-label="Opciones del servicio"
        className="grid h-8 w-8 place-items-center rounded-full text-ink-400 opacity-0 transition-opacity hover:bg-ink-100 group-hover:opacity-100 disabled:cursor-not-allowed"
      >
        {pendiente ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {abierto && !deshabilitado && (
        <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-2xl border border-ink-200/70 bg-white py-1 shadow-card">
          <button
            onClick={alternar}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
          >
            {activo ? (
              <>
                <Pause className="h-4 w-4" />
                Pausar servicio
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Reactivar
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
