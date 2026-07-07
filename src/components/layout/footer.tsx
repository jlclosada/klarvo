import { Logo } from "@/components/ui/logo";
import { nav, site } from "@/lib/config";
import Link from "next/link";

const producto = [
  { label: "Características", href: "/caracteristicas" },
  { label: "Precios", href: "/precios" },
  { label: "VeriFactu 2027", href: "/verifactu" },
  { label: "Crear cuenta", href: "/registro" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200/60 bg-ink-50/40">
      <div className="container-tight max-w-6xl py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              {site.tagline} Todo en un mismo sitio, listo para 2027.
            </p>
            <p className="mt-4 text-xs text-ink-400">
              Datos alojados en la Unión Europea · RGPD
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Producto
            </h3>
            <ul className="mt-4 space-y-3">
              {producto.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-600 transition-colors hover:text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {nav.legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-600 transition-colors hover:text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-200/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
          <p className="max-w-md text-xs text-ink-400">
            La información sobre VeriFactu es orientativa y no constituye asesoría
            fiscal. Confirma los plazos vigentes con tu asesor.
          </p>
        </div>
      </div>
    </footer>
  );
}
