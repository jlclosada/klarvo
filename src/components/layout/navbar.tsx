"use client";

import { Logo } from "@/components/ui/logo";
import { nav } from "@/lib/config";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-full px-4 transition-all duration-500 sm:px-5",
          scrolled
            ? "glass shadow-soft sm:mx-4"
            : "border border-transparent bg-transparent",
        )}
      >
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {nav.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="btn-ghost">
            Entrar
          </Link>
          <Link href="/registro" className="btn-primary">
            Probar gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-100 md:hidden"
          aria-label="Menú"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-2 rounded-3xl glass p-4 shadow-card md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {nav.main.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-100"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ink-200/60 pt-3">
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                  Entrar
                </Link>
                <Link href="/registro" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Probar gratis
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
