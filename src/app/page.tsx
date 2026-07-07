import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { VerifactuSection } from "@/components/landing/verifactu-section";
import { Verticales } from "@/components/landing/verticales";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Verticales />
        <Features />
        <VerifactuSection />
        <HowItWorks />
        <PricingPreview />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
