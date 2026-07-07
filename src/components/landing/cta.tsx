import { Reveal } from "@/components/motion/reveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Cta() {
  return (
    <section className="section">
      <div className="container-tight max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-600 to-brand-800 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-40" />
            <div className="pointer-events-none absolute -left-10 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Empieza hoy. Ten tu agenda y tus facturas listas para 2027.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/80">
                14 días gratis. Sin tarjeta para probar. Sin permanencia.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/registro"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-ink-900 shadow-soft transition-transform hover:-translate-y-0.5"
                >
                  Crear mi cuenta
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/precios"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
                >
                  Ver precios
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
