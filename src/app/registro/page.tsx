import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Empieza gratis con Klarvo. 14 días de prueba, sin permanencia.",
};

export default function RegistroPage() {
  return (
    <AuthShell
      title="Crea tu cuenta gratis"
      subtitle="14 días de prueba. Sin tarjeta. Sin permanencia."
    >
      <AuthForm mode="registro" />
    </AuthShell>
  );
}
