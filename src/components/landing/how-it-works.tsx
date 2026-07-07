import { Reveal } from "@/components/motion/reveal";

const pasos = [
  {
    n: "01",
    t: "Configura en minutos",
    d: "Elige tu oficio y carga una plantilla de servicios. Horarios, precios y depósitos listos en menos de 10 minutos.",
  },
  {
    n: "02",
    t: "Comparte tu página",
    d: "Recibes una URL propia (klarvo.es/tu-negocio) para que tus clientes reserven solos, sin crear cuenta.",
  },
  {
    n: "03",
    t: "Cobra y factura",
    d: "El depósito se cobra al reservar. Al terminar la cita, la factura se genera sola, encadenada y verificable.",
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-ink-50/40">
      <div className="container-tight max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">En marcha hoy mismo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Tres pasos y a trabajar
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pasos.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl border border-ink-200/70 bg-white p-7 shadow-soft">
                <span className="text-4xl font-semibold text-ink-200">{p.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
