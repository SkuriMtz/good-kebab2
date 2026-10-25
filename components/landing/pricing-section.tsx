import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { PRICING } from "./content";
import { PlanLink } from "./plan-link";

/**
 * Free / One / Max. Oscuro: tres columnas sin caja, el nombre del plan enorme. Claro: tarjetas blancas
 * de 28px sobre la banda. One y Max son "Próximamente" y no llevan cifras. Un solo botón principal.
 */
export function PricingSection() {
  return (
    <section id="precios" aria-labelledby="precios-title" className="band">
      <Reveal className="page-w py-section">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-6">
            <p data-r className="t-label">
              {PRICING.label}
            </p>
            <h2 data-r id="precios-title" className="t-title-lg mt-5">
              {PRICING.title}
            </h2>
          </div>
          <p data-r className="t-lead text-ink lg:col-span-5 lg:col-start-8 lg:pb-3">
            {PRICING.subtitle}
          </p>
        </div>

        <ul className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-3 lg:gap-8 light:gap-5 light:lg:gap-5">
          {PRICING.plans.map((plan) => (
            <li key={plan.id} data-r className="card flex flex-col">
              <h3 className="t-title-lg light:t-title">{plan.name}</h3>
              <p className={plan.soon ? "t-status mt-5 flex h-8 items-center" : "t-h3 mt-5 flex h-8 items-center"}>{plan.price}</p>
              <ul className="mt-8 flex flex-1 flex-col gap-3.5 lg:mt-10">
                {plan.includes.map((line) => (
                  <li key={line} className="t-body text-ink">
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-10 lg:mt-12">
                {plan.id === "free" ? (
                  <ButtonLink href="/entrar" size="lg" className="light:w-full lg:w-auto">
                    {plan.button}
                  </ButtonLink>
                ) : (
                  <PlanLink plan={plan.id}>{plan.button}</PlanLink>
                )}
              </div>
            </li>
          ))}
        </ul>

        <p data-r className="t-small mt-12 max-w-[56ch] text-ink-3 lg:mt-16">
          {PRICING.note}
        </p>
      </Reveal>
    </section>
  );
}
