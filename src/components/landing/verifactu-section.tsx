import { Reveal } from "@/components/motion/reveal";
import { ArrowRight, FileCheck2, Lock, QrCode, ShieldCheck } from "lucide-react";
import Link from "next/link";

const pilares = [
  { icon: Lock, t: "Integridad", d: "Registros inalterables encadenados con huella criptográfica." },
  { icon: FileCheck2, t: "Conservación", d: "Cada factura se guarda de forma íntegra y accesible." },
  { icon: QrCode, t: "Trazabilidad", d: "Código QR verificable en cada documento emitido." },
  { icon: ShieldCheck, t: "Sin sustos", d: "Actívalo cuando sea obligatorio; ya está construido." },
];

export function VerifactuSection() {
  return (
    <section id="verifactu" className="section">
      <div className="container-tight max-w-6xl">
        <div className="relative overflow-hidden rounded-[32px] border border-ink-200/70 bg-ink-900 px-6 py-14 text-white sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ventaja legal única
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Preparado para VeriFactu
                <br />
                antes que tu competencia.
              </h2>
              <p className="mt-4 max-w-lg text-white/70">
                La facturación verificable será obligatoria para autónomos el 1 de
                julio de 2027. Klarvo construye la integridad de tus facturas
                desde el primer día, para que el cambio sea un clic, no una migración.
              </p>
              <p className="mt-3 text-xs text-white/45">
                Fechas orientativas sujetas a cambios normativos. No es asesoría
                fiscal; confírmalo con tu asesor.
              </p>
              <Link
                href="/verifactu"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5"
              >
                Saber más
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-3">
                {pilares.map((p) => (
                  <div
                    key={p.t}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:bg-white/10"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
                      <p.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold">{p.t}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">
                      {p.d}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
