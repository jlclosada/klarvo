import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Accede a tu cuenta de Klarvo.",
};

export default function LoginPage() {
  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Entra para gestionar tu agenda.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
