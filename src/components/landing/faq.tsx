"use client";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "¿Necesito conocimientos técnicos para empezar?",
    a: "No. Eliges tu tipo de negocio, cargas una plantilla de servicios y publicas tu página de reservas. En menos de 10 minutos estás recibiendo citas.",
  },
  {
    q: "¿Cómo reduce los no-shows exactamente?",
    a: "Puedes exigir un depósito o guardar una tarjeta de garantía al reservar (a través de Stripe). El cliente se compromete y las ausencias caen drásticamente. Tú defines la política de cancelación y reembolso.",
  },
  {
    q: "¿Qué es VeriFactu y por qué me importa?",
    a: "Es la normativa española de facturación verificable, obligatoria para autónomos a partir del 1 de julio de 2027 (fecha sujeta a cambios). Klarvo genera facturas con registro inalterable y encadenado desde el primer día, para que estés listo sin migraciones. No es asesoría fiscal: confírmalo con tu asesor.",
  },
  {
    q: "¿Los datos de mis clientes son míos?",
    a: "Sí. A diferencia de un marketplace, tus clientes son tuyos. Puedes exportarlos cuando quieras. Los datos se alojan en la Unión Europea y cumplimos el RGPD.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí, no hay permanencia. Empiezas con 14 días gratis y puedes cancelar en cualquier momento desde tus ajustes.",
  },
  {
    q: "¿Funciona para varios profesionales?",
    a: "Sí. El plan Equipo permite hasta 5 profesionales, cada uno con su agenda, y el plan Centro es para multi-sede con profesionales ilimitados.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section bg-ink-50/40">
      <div className="container-tight max-w-3xl">
        <Reveal className="text-center">
          <p className="eyebrow">Dudas frecuentes</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Todo lo que quieres saber
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.04}>
                <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium text-ink-900">{f.q}</span>
                    <Plus
                      className={cn(
                        "h-4 w-4 shrink-0 text-ink-400 transition-transform duration-300",
                        isOpen && "rotate-45",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
