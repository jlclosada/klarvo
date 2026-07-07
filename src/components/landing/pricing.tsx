"use client";

import { planes } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PricingCards({ compact = false }: { compact?: boolean }) {
  const [anual, setAnual] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white p-1 shadow-soft">
          <button
            onClick={() => setAnual(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !anual ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900",
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setAnual(true)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              anual ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900",
            )}
          >
            Anual
            <span className="ml-1.5 rounded-full bg-accent-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-700">
              −20%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {planes.map((plan, i) => {
          const precio = anual ? plan.precioAnioMes : plan.precioMes;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-white p-7 transition-all duration-300",
                plan.destacado
                  ? "border-ink-900 shadow-card lg:-mt-3 lg:mb-0"
                  : "border-ink-200/70 shadow-soft hover:-translate-y-1 hover:shadow-card",
              )}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-900 px-3 py-1 text-[11px] font-semibold text-white">
                  Más popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-ink-900">{plan.nombre}</h3>
              <p className="mt-1 text-sm text-ink-500">{plan.claim}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-ink-900">
                  {precio}€
                </span>
                <span className="text-sm text-ink-400">/mes</span>
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {anual ? "facturado anualmente · " : ""}
                {plan.limite}
              </p>

              <Link
                href="/registro"
                className={cn(
                  "mt-6 w-full",
                  plan.destacado ? "btn-primary" : "btn-outline",
                )}
              >
                Empezar gratis
              </Link>

              {!compact && (
                <ul className="mt-6 space-y-3 border-t border-ink-100 pt-6">
                  {plan.incluye.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-ink-400">
        Todos los planes incluyen 14 días de prueba. Comisión opcional del 1% sobre
        depósitos cobrados. Sin permanencia.
      </p>
    </div>
  );
}
