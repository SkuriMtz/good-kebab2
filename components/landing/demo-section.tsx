import { Reveal } from "@/components/motion/reveal";
import { DEMO } from "./content";
import { DemoChat } from "./demo-chat";

/**
 * Demo en vivo. Oscuro: el texto a un lado y el chat flotando sobre negro, sin caja.
 * Claro: el chat vive dentro de una tarjeta blanca de 28px sobre una banda #f5f5f7.
 */
export function DemoSection() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="band">
      <Reveal className="page-w grid items-start gap-12 py-section lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 lg:self-stretch">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+56px)]">
            <p data-r className="t-label">
              {DEMO.label}
            </p>
            <h2 data-r id="demo-title" className="t-title-lg mt-5">
              {DEMO.title}
            </h2>
            <p data-r className="t-lead mt-6 text-ink">
              {DEMO.intro}
            </p>
          </div>
        </div>
        <div data-r className="card lg:col-span-6 lg:col-start-7">
          <DemoChat />
        </div>
      </Reveal>
    </section>
  );
}
