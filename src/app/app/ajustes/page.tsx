import { AjustesNegocio } from "@/components/app/ajustes-negocio";
import { AjustesRestaurante } from "@/components/app/ajustes-restaurante";
import { Topbar } from "@/components/app/topbar";
import { Reveal } from "@/components/motion/reveal";
import { esVerticalRestauracion, site } from "@/lib/config";
import { getNegocioAjustes } from "@/lib/db/panel";
import {
    Check,
    ChevronRight,
    Clock,
    CreditCard,
    ShieldCheck,
    Sparkles,
    Store,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const secciones = [
  { icon: Store, t: "Negocio", d: "Nombre, logotipo, dirección y datos fiscales.", href: "#negocio" },
  { icon: Clock, t: "Horarios", d: "Apertura, festivos y huecos bloqueados.", href: "#negocio" },
  { icon: CreditCard, t: "Pagos", d: "Conecta Stripe para cobrar depósitos y suscripción.", href: "#suscripcion" },
  { icon: ShieldCheck, t: "Facturación fiscal", d: "Serie, numeración y VeriFactu.", href: "#facturacion" },
];

export default async function AjustesPage() {
  const ajustes = await getNegocioAjustes();
  if (!ajustes) notFound();

  return (
    <>
      <Topbar title="Ajustes" subtitle="Configura tu negocio y tu cuenta" />

      <div className="flex-1 space-y-6 p-6">
        {/* Accesos a secciones */}
        <div className="grid gap-4 sm:grid-cols-2">
          {secciones.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.05}>
              <a
                href={s.href}
                className="flex w-full items-center gap-4 rounded-3xl border border-ink-200/70 bg-white p-5 text-left shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{s.t}</p>
                  <p className="truncate text-sm text-ink-400">{s.d}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" />
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div id="negocio" className="scroll-mt-24">
            <AjustesNegocio
              nombre={ajustes.nombre}
              fiscales={ajustes.fiscales}
              horario={ajustes.horario}
              slug={ajustes.slug}
              vertical={ajustes.vertical}
              publicUrl={site.url.replace("https://", "")}
              deshabilitado={ajustes.demo}
            />
          </div>
        </Reveal>

        {esVerticalRestauracion(ajustes.vertical) && (
          <Reveal>
            <div id="restaurante" className="scroll-mt-24">
              <AjustesRestaurante
                config={ajustes.configRestaurante}
                deshabilitado={ajustes.demo}
              />
            </div>
          </Reveal>
        )}

        {/* Facturación fiscal / VeriFactu */}
        <Reveal id="facturacion" className="scroll-mt-24 rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                Facturación verificable (VeriFactu)
              </h2>
              <p className="mt-1 max-w-lg text-sm text-ink-500">
                Tus facturas ya se generan encadenadas con huella criptográfica.
                Podrás activar el envío a la AEAT cuando sea obligatorio, mediante
                un proveedor certificado.
              </p>
              <p className="mt-2 text-xs text-ink-400">
                Información orientativa. No es asesoría fiscal.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-700">
              <Check className="h-3.5 w-3.5" />
              Preparado
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniCampo label="Serie" value={ajustes.serieFactura} />
            <MiniCampo
              label="Próximo número"
              value={String(ajustes.proximoNumeroFactura)}
            />
            <MiniCampo label="Envío AEAT" value="Inactivo" />
          </div>
        </Reveal>

        {/* Suscripción */}
        <Reveal id="suscripcion" className="scroll-mt-24 flex flex-col items-start justify-between gap-4 rounded-3xl border border-ink-200/70 bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-soft sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Plan {ajustes.plan}</h2>
              <p className="text-sm text-white/70">
                Sube a Equipo para WhatsApp, bonos y agenda por profesional.
              </p>
            </div>
          </div>
          <Link
            href="/precios"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5"
          >
            Mejorar plan
          </Link>
        </Reveal>
      </div>
    </>
  );
}

function MiniCampo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/50 px-4 py-3">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}
