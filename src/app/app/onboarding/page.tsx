import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { getResumenOnboarding } from "@/lib/db/panel";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Configura tu negocio",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const resumen = await getResumenOnboarding();

  // Sin sesión o en modo demo: el onboarding no aplica.
  if (!resumen) redirect("/app");
  // Ya configurado: directo al panel.
  if (resumen.completo) redirect("/app");

  return <OnboardingWizard resumen={resumen} />;
}
