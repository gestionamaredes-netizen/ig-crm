import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { Product } from "@/components/product";
import { Presentations } from "@/components/presentations";
import { HowToUse } from "@/components/how-to-use";
import { Benefits } from "@/components/benefits";
import { Coverage } from "@/components/coverage";
import { Wholesale } from "@/components/wholesale";
import { Gallery } from "@/components/gallery";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Product />
        <Presentations />
        <HowToUse />
        <Benefits />
        <Coverage />
        <Wholesale />
        <Gallery />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
