import { Reveal } from "@/components/motion/reveal";
import { verticales } from "@/lib/config";

export function Verticales() {
  return (
    <section className="border-y border-ink-200/50 bg-ink-50/40 py-12">
      <div className="container-tight max-w-6xl">
        <Reveal>
          <p className="text-center text-sm font-medium text-ink-400">
            Pensado para el flujo real de cada oficio
          </p>
        </Reveal>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {verticales.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200/70 bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-soft">
                <span aria-hidden>{v.emoji}</span>
                {v.nombre}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
