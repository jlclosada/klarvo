import { Logo } from "@/components/ui/logo";
import { CalendarCheck, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const bullets = [
  { icon: CalendarCheck, t: "Agenda online 24/7", d: "Tus clientes reservan solos." },
  { icon: CreditCard, t: "Cobra depósitos", d: "Menos no-shows, más ingresos." },
  { icon: ShieldCheck, t: "Listo para VeriFactu", d: "Facturas encadenadas desde el día 1." },
];

/** Layout partido para login y registro con panel de marca a la izquierda. */
export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel marca */}
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative">
          <Logo href="/" />
        </div>
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Tu agenda y tus facturas, en un mismo sitio.
          </h2>
          <ul className="mt-8 space-y-5">
            {bullets.map((b) => (
              <li key={b.t} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10">
                  <b.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{b.t}</p>
                  <p className="text-sm text-white/60">{b.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">
          Datos alojados en la UE · RGPD · Sin permanencia
        </p>
      </div>

      {/* Panel formulario */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo href="/" />
          </div>
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-xs text-ink-400">
            Al continuar aceptas los{" "}
            <Link href="/legal/terminos" className="underline hover:text-ink-600">
              Términos
            </Link>{" "}
            y la{" "}
            <Link href="/legal/privacidad" className="underline hover:text-ink-600">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
