import { AgendaDia } from "@/components/app/agenda-dia";
import { Topbar } from "@/components/app/topbar";
import { getAgendaDia, getClientes, getServicios } from "@/lib/db/panel";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const [agenda, servicios, clientes] = await Promise.all([
    getAgendaDia(fecha),
    getServicios(),
    getClientes(),
  ]);

  const serviciosActivos = servicios.filter((s) => s.activo);

  return (
    <>
      <Topbar title="Calendario" subtitle="Gestiona tu agenda del día" />
      <AgendaDia
        agenda={agenda}
        servicios={serviciosActivos}
        clientes={clientes}
      />
    </>
  );
}
