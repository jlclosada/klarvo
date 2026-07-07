"use client";

import { cancelarCitaPorToken } from "@/lib/reservas/gestion-actions";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function GestionCita({
  token,
  puedeCancelar,
}: {
  token: string;
  puedeCancelar: boolean;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  if (!puedeCancelar) return null;

  function cancelar() {
    setError(null);
    startTransition(async () => {
      const res = await cancelarCitaPorToken(token);
      if (!res.ok) {
        setError(res.error ?? "No se pudo cancelar.");
        return;
      }
      router.refresh();
    });
  }

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white py-3 text-sm font-medium text-ink-600 transition hover:border-red-300 hover:text-red-600"
      >
        <XCircle className="h-4 w-4" />
        Cancelar reserva
      </button>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/60 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-red-700">
        <AlertTriangle className="h-4 w-4" />
        ¿Seguro que quieres cancelar?
      </p>
      <p className="mt-1 text-xs text-red-600/80">
        Si cancelas con más de 24 h de antelación, te devolvemos el depósito.
      </p>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={cancelar}
          disabled={pendiente}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {pendiente && <Loader2 className="h-4 w-4 animate-spin" />}
          Sí, cancelar
        </button>
        <button
          onClick={() => setConfirmando(false)}
          disabled={pendiente}
          className="flex-1 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
        >
          No
        </button>
      </div>
    </div>
  );
}
