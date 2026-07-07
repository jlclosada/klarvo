import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Reveal } from "@/components/motion/reveal";
import { ArrowRight, FileCheck2, Lock, QrCode, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VeriFactu 2027",
  description:
    "Qué es VeriFactu, a quién afecta y cómo Klarvo te deja las facturas listas antes de que sea obligatorio.",
};

const requisitos = [
  {
    icon: Lock,
    t: "Integridad",
    d: "Cada factura se registra de forma inalterable y se encadena con la anterior mediante una huella criptográfica (hash).",
  },
  {
    icon: FileCheck2,
    t: "Conservación",
    d: "Los registros se guardan íntegros y no se pueden modificar ni borrar sin dejar rastro.",
  },
  {
    icon: QrCode,
    t: "Trazabilidad",
    d: "Cada documento incluye un código QR verificable que permite comprobar su autenticidad.",
  },
  {
    icon: ShieldCheck,
    t: "Accesibilidad",
    d: "Tus facturas están siempre disponibles y listas para ser consultadas o remitidas a la AEAT.",
  },
];

const fechas = [
  { d: "1 de enero de 2027", t: "Sociedades", n: "Obligatorio para personas jurídicas." },
  { d: "1 de julio de 2027", t: "Autónomos", n: "Obligatorio para el resto de contribuyentes." },
];

export default function VerifactuPage() {
  return (
    <>
      <Navbar />
      <main className="pt-36">
        <section className="pb-4">
          <div className="container-tight max-w-3xl text-center">
            <Reveal>
              <span className="chip">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                Ventaja legal
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
                Listo para VeriFactu, sin dolores de cabeza
              </h1>
              <p className="mx-auto mt-5 text-lg leading-relaxed text-ink-500">
                VeriFactu es el sistema español de facturación verificable. Obligará
                a que tu software genere registros inalterables, con huella y código
                QR. Klarvo ya lo construye por ti desde el primer día.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="container-tight max-w-4xl">
            <Reveal className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-sm leading-relaxed text-amber-900">
                <strong>Aviso importante.</strong> Las fechas y requisitos de
                VeriFactu han cambiado varias veces y pueden volver a hacerlo. Esta
                página es orientativa y <strong>no constituye asesoría fiscal</strong>.
                Confirma siempre el estado normativo vigente con tu asesor.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {fechas.map((f, i) => (
                <Reveal key={f.t} delay={i * 0.08}>
                  <div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
                    <p className="text-sm font-medium text-brand-600">{f.d}</p>
                    <h3 className="mt-1 text-xl font-semibold text-ink-900">{f.t}</h3>
                    <p className="mt-2 text-sm text-ink-500">{f.n}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section pt-0">
          <div className="container-tight max-w-4xl">
            <Reveal className="text-center">
              <p className="eyebrow">Los cuatro pilares</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
                Cómo lo cumplimos técnicamente
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {requisitos.map((r, i) => (
                <Reveal key={r.t} delay={i * 0.06}>
                  <div className="flex h-full gap-4 rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white">
                      <r.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-ink-900">{r.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-500">{r.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-12 text-center">
              <Link href="/registro" className="btn-primary px-6 py-3 text-base">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
