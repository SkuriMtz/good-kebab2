import { Reveal } from "@/components/motion/reveal";
import { AgentBlob } from "@/components/brand/agent-blob";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AUDIENCE, AUDIENCE_SECTION } from "./content";

/**
 * Cuatro situaciones, nunca tipos de negocio. En zigzag: el texto cambia de lado en cada una y,
 * del otro lado, lo que hace cada agente en esa situación (con su personaje pequeño).
 */
export function AudienceSection() {
  return (
    <section id="para-quien" aria-labelledby="para-quien-title" className="page-w py-section">
      <Reveal>
        <h2 data-r id="para-quien-title" className="t-title-lg">
          {AUDIENCE_SECTION.title}
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col gap-20 lg:mt-24 lg:gap-36">
        {AUDIENCE.map((situation, i) => {
          const flip = i % 2 === 1;
          return (
            <Reveal
              as="article"
              key={situation.title}
              className="grid items-start gap-10 light:border-t light:border-line light:pt-12 lg:grid-cols-12 lg:gap-8"
            >
              <div className={cn("lg:col-span-5", flip ? "lg:col-start-8 lg:row-start-1" : "lg:col-start-1")}>
                <h3 data-r className="t-title">
                  {situation.title}
                </h3>
                <p data-r className="t-lead mt-6 text-ink">
                  {situation.text}
                </p>
              </div>
              <ul
                className={cn(
                  "flex flex-col gap-7 lg:col-span-6 lg:gap-9",
                  flip ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-7",
                )}
              >
                {AGENTS.map((agent) => (
                  <li key={agent.id} data-r className="grid grid-cols-[auto_1fr] items-start gap-x-5">
                    <AgentBlob agent={agent.id} size={44} className="mt-0.5" />
                    <div>
                      <p className="t-h3">{agent.name}</p>
                      <p className="t-body mt-1.5 text-ink-2 light:text-ink">{situation.agents[agent.id]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
