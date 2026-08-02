import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProductSection } from "@/components/sections/ProductSection";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Benefits } from "@/components/sections/Benefits";
import { Coverage } from "@/components/sections/Coverage";
import { WholesaleSection } from "@/components/sections/Wholesale";
import { Gallery } from "@/components/sections/Gallery";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { AquaAssistant } from "@/components/assistant/AquaAssistant";
import { featureFlags } from "@/config/features";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <ProductSection />
        <ProductCatalog />
        <HowItWorks />
        <Benefits />
        <Coverage />
        <WholesaleSection />
        <Gallery />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
      {featureFlags.assistant && <AquaAssistant />}
    </>
  );
}
