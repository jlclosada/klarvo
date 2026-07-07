import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { site } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo trata Klarvo los datos personales conforme al RGPD y la LOPDGDD.",
};

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de Privacidad" updated="6 de julio de 2026">
      <p>
        En {site.name} nos tomamos en serio la protección de tus datos. Esta
        política explica qué datos tratamos, con qué fines y qué derechos tienes,
        conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018
        (LOPDGDD). <strong>Este texto es una plantilla orientativa; revísalo con
        un profesional antes de publicarlo.</strong>
      </p>

      <LegalSection n={1} title="Responsable del tratamiento">
        <p>
          Titular de la plataforma: {site.name}. Contacto:{" "}
          <a className="text-brand-600" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          . Los datos identificativos completos (denominación, NIF y domicilio) se
          indicarán en el Aviso Legal.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Doble rol: responsable y encargado">
        <p>
          Respecto a los datos de los profesionales que contratan {site.name},
          actuamos como <strong>responsables</strong> del tratamiento. Respecto a
          los datos de los clientes finales que reservan cita en cada negocio,
          actuamos como <strong>encargados</strong> del tratamiento: el negocio es
          el responsable. Esta relación se regula en nuestro{" "}
          <a className="text-brand-600" href="/legal/dpa">
            Contrato de Encargado de Tratamiento (DPA)
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n={3} title="Datos que tratamos y finalidades">
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de cuenta del profesional: nombre, email, datos fiscales y de facturación.</li>
          <li>Datos de clientes finales: nombre, teléfono, email e historial de citas.</li>
          <li>Datos de pago: gestionados por Stripe; no almacenamos números de tarjeta.</li>
          <li>Datos de uso: cookies técnicas y métricas de la plataforma.</li>
        </ul>
        <p>
          Finalidades: prestar el servicio de reservas y facturación, enviar
          recordatorios, cobrar depósitos y suscripciones, y cumplir obligaciones
          legales.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Datos de categoría especial (salud)">
        <p>
          Algunos verticales (fisioterapia, psicología, nutrición) pueden implicar
          datos de salud, considerados de categoría especial. Se tratan con medidas
          de seguridad reforzadas, cifrado y solo cuando exista base legítima y
          consentimiento explícito.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Base jurídica">
        <p>
          Ejecución del contrato (prestación del servicio), consentimiento (envío de
          comunicaciones y tratamiento por parte del negocio), interés legítimo
          (seguridad y mejora) y cumplimiento de obligaciones legales (facturación).
        </p>
      </LegalSection>

      <LegalSection n={6} title="Conservación">
        <p>
          Conservamos los datos mientras la cuenta esté activa y, tras la baja,
          durante los plazos legales aplicables (por ejemplo, obligaciones fiscales
          y contables). Después se suprimen o anonimizan.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Encargados y transferencias">
        <p>
          Trabajamos con proveedores que actúan como encargados: Supabase
          (alojamiento en la UE), Stripe (pagos) y Resend (email). Cuando exista
          transferencia internacional, se ampara en cláusulas contractuales tipo
          (SCC) u otras garantías adecuadas.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Tus derechos">
        <p>
          Puedes ejercer los derechos de acceso, rectificación, supresión,
          oposición, limitación y portabilidad escribiendo a{" "}
          <a className="text-brand-600" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          . También puedes reclamar ante la Agencia Española de Protección de Datos
          (aepd.es).
        </p>
      </LegalSection>
    </LegalShell>
  );
}
