"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * Cierra la sesión de Supabase de verdad (el enlace a /login por sí solo no
 * bastaba: el middleware devolvía al usuario al panel al seguir habiendo sesión).
 */
export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  function salir() {
    startTransition(async () => {
      try {
        await createClient().auth.signOut();
      } finally {
        router.push("/login");
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={salir}
      disabled={pendiente}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-60",
        className,
      )}
    >
      {pendiente ? (
        <Loader2 className="h-4.5 w-4.5 animate-spin" />
      ) : (
        <LogOut className="h-4.5 w-4.5" />
      )}
      Salir
    </button>
  );
}
