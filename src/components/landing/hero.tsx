"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AppPreview } from "./preview";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 sm:pt-40">
      {/* Fondo mesh + blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh-brand" />
      <div className="pointer-events-none absolute -left-32 top-20 -z-10 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl animate-blob" />
      <div
        className="pointer-events-none absolute -right-24 top-40 -z-10 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-grid-fade [background-size:100%_100%,32px_32px,32px_32px] mask-fade-b opacity-70" />

      <div className="container-tight max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Columna texto */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="chip">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                Listo para VeriFactu 2027
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
              className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
            >
              Tu agenda y tus facturas,{" "}
              <span className="gradient-text">sin perder ni un cliente.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500"
            >
              Reservas online, cobro de depósitos para acabar con los no-shows y
              facturación legal — pensado para peluquerías, estética, fisio y
              bienestar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.19 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/registro" className="btn-primary px-6 py-3 text-base">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/verifactu" className="btn-outline px-6 py-3 text-base">
                Cómo funciona VeriFactu
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-400"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-600" />
                Sin permanencia
              </span>
              <span>14 días de prueba</span>
              <span>Datos en la UE (RGPD)</span>
            </motion.div>
          </div>

          {/* Columna mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <AppPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
