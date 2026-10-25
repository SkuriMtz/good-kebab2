import { Reveal } from "@/components/motion/reveal";
import { WAITLIST_SECTION } from "./content";
import { WaitlistForm } from "./waitlist-form";

/** Cierre de la portada: título enorme, texto y la lista de espera con el plan de interés. */
export function WaitlistSection() {
  return (
    <section id="lista" aria-labelledby="lista-title" className="page-w pt-section">
      <Reveal>
        <p data-r className="t-label">
          {WAITLIST_SECTION.label}
        </p>
        <h2 data-r id="lista-title" className="t-display mt-6 max-w-[16ch]">
          {WAITLIST_SECTION.title}
        </h2>
        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <p data-r className="t-lead text-ink lg:col-span-5">
            {WAITLIST_SECTION.text}
          </p>
          <div data-r className="lg:col-span-6 lg:col-start-7">
            <WaitlistForm origen="lista" withPlan />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
