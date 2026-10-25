import { Hero } from "@/components/landing/hero";
import { AgentsSection } from "@/components/landing/agents-section";
import { AudienceSection } from "@/components/landing/audience-section";
import { DemoSection } from "@/components/landing/demo-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { WaitlistSection } from "@/components/landing/waitlist-section";

/** Portada: hero con la figura, agentes, para quién, demo, precios, posibles preguntas y lista de espera. */
export default function Home() {
  return (
    <>
      <Hero />
      <AgentsSection />
      <AudienceSection />
      <DemoSection />
      <PricingSection />
      <FaqSection />
      <WaitlistSection />
    </>
  );
}
