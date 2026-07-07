import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { ReactNode } from "react";

/** Envoltorio común para las páginas legales con tipografía cuidada. */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-36">
        <article className="container-tight max-w-3xl pb-24">
          <header className="border-b border-ink-200/60 pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-ink-400">
              Última actualización: {updated}
            </p>
          </header>
          <div className="legal-prose mt-10 space-y-6 text-[15px] leading-relaxed text-ink-600">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

/** Sección con título dentro de una página legal. */
export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-ink-900">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}
