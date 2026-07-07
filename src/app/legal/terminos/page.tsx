import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { site } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso del servicio Klarvo para profesionales.",
};

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y Condiciones" updated="6 de julio de 2026">
      <p>
        Estas condiciones regulan el uso de la plataforma {site.name} por parte de
        los profesionales y negocios que la contratan.{" "}
        <strong>Plantilla orientativa; revísala con un profesional legal.</strong>
      </p>

      <LegalSection n={1} title="Objeto del servicio">
        <p>
          {site.name} es un software como servicio (SaaS) para la gestión de
          reservas, clientes y facturación de negocios de belleza y bienestar. El
          acceso se presta bajo suscripción según el plan contratado.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Cuenta y responsabilidad del profesional">
        <ul className="list-disc space-y-1 pl-5">
          <li>Eres responsable de la veracidad de los datos y de la custodia de tus credenciales.</li>
          <li>Eres el responsable del tratamiento de los datos de tus clientes finales.</li>
          <li>Debes definir y comunicar tu política de cancelación y depósitos.</li>
          <li>Debes cumplir la normativa fiscal y de protección de datos aplicable a tu actividad.</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Planes, precios y pagos">
        <p>
          Los precios vigentes se publican en la página de precios. La suscripción
          se renueva automáticamente por periodos, salvo cancelación. Los pagos se
          procesan a través de Stripe. Podemos aplicar una comisión sobre los
          depósitos cobrados a través de la plataforma, indicada de forma expresa.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Periodo de prueba y cancelación">
        <p>
          Ofrecemos un periodo de prueba gratuito. Puedes cancelar en cualquier
          momento desde tus ajustes; no hay permanencia. La cancelación surte efecto
          al final del periodo de facturación en curso.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Disponibilidad y límites de responsabilidad">
        <p>
          Trabajamos para ofrecer una alta disponibilidad, pero el servicio se
          presta &quot;tal cual&quot;. En la medida permitida por la ley, no
          respondemos de daños indirectos ni de lucro cesante. Nuestra
          responsabilidad total se limita a las cantidades abonadas en los últimos
          doce meses.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Propiedad de los datos y portabilidad">
        <p>
          Los datos de tus clientes son tuyos. Puedes exportarlos en cualquier
          momento. Tras la baja, se conservan durante los plazos legales y después
          se eliminan.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Facturación verificable (VeriFactu)">
        <p>
          Las funciones de facturación se diseñan pensando en los requisitos de
          integridad, conservación, accesibilidad y trazabilidad. La información
          sobre plazos es orientativa y no constituye asesoría fiscal.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Ley aplicable">
        <p>
          Estas condiciones se rigen por la legislación española. Para cualquier
          controversia, las partes se someten a los juzgados que correspondan
          conforme a la normativa de consumidores y usuarios cuando resulte
          aplicable.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
