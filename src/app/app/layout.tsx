import { MobileNav } from "@/components/app/mobile-nav";
import { Sidebar } from "@/components/app/sidebar";
import { getMiNegocio } from "@/lib/db/panel";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const negocio = await getMiNegocio();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar negocio={negocio} />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">{children}</div>
      <MobileNav />
      {/* Enlace de escape para volver al sitio público */}
      <Link href="/" className="sr-only">
        Ir al sitio público
      </Link>
    </div>
  );
}
