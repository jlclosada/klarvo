import { Faq } from "@/components/landing/faq";
import { PricingCards } from "@/components/landing/pricing";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Reveal } from "@/components/motion/reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes claros de Klarvo: Solo, Equipo y Centro. 14 días gratis, sin permanencia y listo para VeriFactu.",
};

export default function PreciosPage() {
  return (
    <>
      <Navbar />
      <main className="pt-36">
        <section className="pb-8">
          <div className="container-tight max-w-6xl text-center">
            <Reveal>
              <p className="eyebrow">Precios</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
                Elige tu plan
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
                Empieza gratis. Crece cuando lo necesites. Sin comisiones sobre los
                clientes que ya son tuyos.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-20">
          <div className="container-tight max-w-6xl">
            <PricingCards />
          </div>
        </section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
