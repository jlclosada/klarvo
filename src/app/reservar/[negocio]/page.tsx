import { BookingFlow } from "@/components/reservar/booking-flow";
import { Logo } from "@/components/ui/logo";
import {
    getHuecosDisponibles,
    getNegocioPorSlug,
    getServiciosPublicos,
} from "@/lib/db/reservas-publicas";
import { Clock, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ negocio: string }>;
}): Promise<Metadata> {
  const { negocio } = await params;
  const data = await getNegocioPorSlug(negocio);
  if (!data) return { title: "Negocio no encontrado" };
  return {
    title: `Reservar cita · ${data.nombre}`,
    description: `Reserva tu cita online en ${data.nombre}.`,
    robots: { index: false },
  };
}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ negocio: string }>;
}) {
  const { negocio: slug } = await params;
  const negocio = await getNegocioPorSlug(slug);
  if (!negocio) notFound();

  const servicios = await getServiciosPublicos(negocio.id);

  const hoy = new Date();
  const huecos = servicios.length
    ? await getHuecosDisponibles(negocio.id, servicios[0], hoy)
    : [];

  const iniciales = negocio.nombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Cabecera del negocio */}
      <header className="relative overflow-hidden border-b border-ink-200/60 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-mesh-brand opacity-60" />
        <div className="container-tight relative max-w-3xl py-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-ink-900 text-xl font-semibold text-white shadow-glow">
            {iniciales}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">
            {negocio.nombre}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{negocio.vertical}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-ink-400">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              4,9 · 120 reseñas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Madrid centro
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Abierto hoy
            </span>
          </div>
        </div>
      </header>

      {/* Flujo de reserva */}
      <main className="container-tight max-w-3xl py-12">
        <BookingFlow
          negocioSlug={negocio.slug}
          negocioNombre={negocio.nombre}
          servicios={servicios}
          huecosIniciales={huecos}
        />
      </main>

      <footer className="border-t border-ink-200/60 py-8">
        <div className="container-tight max-w-3xl flex flex-col items-center gap-2 text-center">
          <Logo href="/" compact />
          <p className="text-xs text-ink-400">
            Reservas gestionadas con Klarvo · Tus datos protegidos (RGPD)
          </p>
        </div>
      </footer>
    </div>
  );
}
