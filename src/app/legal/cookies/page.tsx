import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Uso de cookies en la plataforma Klarvo.",
};

export default function CookiesPage() {
  return (
    <LegalShell title="Política de Cookies" updated="6 de julio de 2026">
      <p>
        Esta política explica qué cookies utilizamos y con qué finalidad.{" "}
        <strong>Plantilla orientativa; adáptala a tu configuración real.</strong>
      </p>

      <LegalSection n={1} title="¿Qué son las cookies?">
        <p>
          Son pequeños archivos que se almacenan en tu dispositivo al navegar. Nos
          permiten recordar tu sesión y entender cómo se usa la plataforma.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Tipos de cookies que usamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Técnicas (necesarias):</strong> imprescindibles para iniciar
            sesión y mantener la seguridad. No requieren consentimiento.
          </li>
          <li>
            <strong>Analíticas:</strong> nos ayudan a medir el uso de forma
            agregada. Solo se activan con tu consentimiento.
          </li>
          <li>
            <strong>De terceros:</strong> Stripe puede establecer cookies para
            prevenir el fraude durante el pago.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Gestión de cookies">
        <p>
          Puedes aceptar, rechazar o configurar las cookies no esenciales desde el
          banner de consentimiento y en cualquier momento desde los ajustes de tu
          navegador.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Conservación">
        <p>
          Las cookies técnicas duran lo necesario para la sesión; las analíticas
          tienen una caducidad limitada indicada en el banner de consentimiento.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
