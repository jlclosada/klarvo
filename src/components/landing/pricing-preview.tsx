import { Reveal } from "@/components/motion/reveal";
import Link from "next/link";
import { PricingCards } from "./pricing";

export function PricingPreview() {
  return (
    <section id="precios" className="section">
      <div className="container-tight max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Precios claros</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Un precio plano. Sin sorpresas.
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Sin comisiones por cada cliente que ya es tuyo. Empieza gratis y
            paga solo cuando te compense.
          </p>
        </Reveal>

        <div className="mt-12">
          <PricingCards />
        </div>

        <Reveal className="mt-6 text-center">
          <Link href="/precios" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Ver comparativa completa de planes →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
