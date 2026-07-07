import { Cta } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { VerifactuSection } from "@/components/landing/verifactu-section";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Reveal } from "@/components/motion/reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Características",
  description:
    "Reservas online, cobro de depósitos, ficha de cliente, recordatorios y facturación lista para VeriFactu. Todo en Klarvo.",
};

export default function CaracteristicasPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="pt-8">
          <div className="container-tight max-w-6xl text-center">
            <Reveal>
              <p className="eyebrow">Características</p>
              <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
                Una plataforma que trabaja por ti
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">
                Diseñada para el flujo real de un negocio de belleza y bienestar:
                servicios con duración variable, depósitos y clientes recurrentes.
              </p>
            </Reveal>
          </div>
        </section>
        <Features />
        <HowItWorks />
        <VerifactuSection />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
