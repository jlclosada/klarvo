import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
    BarChart3,
    Bell,
    CalendarDays,
    CreditCard,
    FileText,
    Users,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Agenda que se llena sola",
    desc: "Tus clientes reservan online 24/7 con disponibilidad en tiempo real. Sin llamadas ni WhatsApp a deshoras.",
    span: "lg:col-span-2",
    tint: "from-brand-500/10",
  },
  {
    icon: CreditCard,
    title: "Adiós a los no-shows",
    desc: "Cobra un depósito o guarda una tarjeta de garantía al reservar. Reduce las ausencias hasta un 90%.",
    span: "",
    tint: "from-accent-500/10",
  },
  {
    icon: Users,
    title: "Cada cliente, una ficha",
    desc: "Historial, notas privadas, alergias y preferencias. Tus datos son tuyos, no de un marketplace.",
    span: "",
    tint: "from-amber-400/10",
  },
  {
    icon: Bell,
    title: "Recordatorios automáticos",
    desc: "Email 24 h antes (WhatsApp y SMS en planes superiores). Menos olvidos, más ingresos.",
    span: "",
    tint: "from-brand-500/10",
  },
  {
    icon: FileText,
    title: "Facturación lista para 2027",
    desc: "Recibos y facturas con registro inalterable y encadenado. Preparado para VeriFactu desde el primer día.",
    span: "lg:col-span-2",
    tint: "from-accent-500/10",
  },
  {
    icon: BarChart3,
    title: "Sabes cómo va tu negocio",
    desc: "Ingresos del mes, tasa de no-shows, clientes nuevos vs recurrentes y ocupación, de un vistazo.",
    span: "lg:col-span-3",
    tint: "from-ink-500/5",
  },
];

export function Features() {
  return (
    <section id="caracteristicas" className="section">
      <div className="container-tight max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Todo en un mismo sitio</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Menos herramientas sueltas.
            <br />
            Más tiempo para tu trabajo.
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Reservas, pagos, clientes y facturas conviven en la misma app. Sin
            copiar datos de un lado a otro.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <RevealItem key={f.title} className={f.span}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.tint} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-900 text-white shadow-soft">
                    <f.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {f.desc}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
