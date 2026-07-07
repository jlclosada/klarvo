import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { site } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contrato de Encargado de Tratamiento (DPA)",
  description:
    "Condiciones que regulan el tratamiento de datos de clientes finales por parte de Klarvo como encargado.",
};

export default function DpaPage() {
  return (
    <LegalShell
      title="Contrato de Encargado de Tratamiento (DPA)"
      updated="6 de julio de 2026"
    >
      <p>
        Este contrato regula el tratamiento de datos personales de los clientes
        finales que {site.name} (el <strong>Encargado</strong>) realiza por cuenta
        del profesional o negocio (el <strong>Responsable</strong>), conforme al
        art. 28 del RGPD.{" "}
        <strong>Plantilla orientativa; revísala con un profesional legal.</strong>
      </p>

      <LegalSection n={1} title="Objeto y duración">
        <p>
          El Encargado tratará datos personales únicamente para prestar el servicio
          de reservas y facturación contratado, durante la vigencia de la
          suscripción.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Instrucciones del Responsable">
        <p>
          El Encargado tratará los datos siguiendo las instrucciones documentadas
          del Responsable y no los usará para fines propios distintos de la
          prestación del servicio.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Categorías de datos e interesados">
        <ul className="list-disc space-y-1 pl-5">
          <li>Interesados: clientes finales del Responsable.</li>
          <li>Datos: identificativos y de contacto, historial de citas y, en su caso, datos de salud (categoría especial).</li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Medidas de seguridad">
        <p>
          El Encargado aplica medidas técnicas y organizativas adecuadas: cifrado en
          tránsito y en reposo, control de acceso, aislamiento entre negocios
          (multi-tenant con seguridad a nivel de fila) y registro de auditoría.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Subencargados">
        <p>
          El Responsable autoriza el uso de subencargados (Supabase, Stripe, Resend),
          que ofrecen garantías equivalentes. El Encargado informará de cualquier
          cambio previsto.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Asistencia y brechas de seguridad">
        <p>
          El Encargado asistirá al Responsable en la atención de derechos y notificará
          sin dilación indebida cualquier violación de seguridad de la que tenga
          constancia.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Devolución o supresión">
        <p>
          Finalizada la prestación, el Encargado suprimirá o devolverá los datos, a
          elección del Responsable, salvo obligación legal de conservación.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
