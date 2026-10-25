"use client";

import { AgentBlob } from "@/components/brand/agent-blob";
import { buttonClasses } from "@/components/ui/button";
import { PLANS, type Agent } from "@/lib/agents";
import { AGENTS_SECTION, PLAN_NAMES, PRICING } from "./content";

function joinPlans(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/** Ficha de un agente: personaje grande, qué hace, qué nunca hace sin permiso y en qué plan viene. */
export function AgentSheetContent({
  agent,
  onSeePlans,
}: {
  agent: Agent;
  onSeePlans: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const plans = PLANS.filter((p) => p.agents.includes(agent.id)).map((p) => PLAN_NAMES[p.id]);
  const soonPlans = plans.filter((p) => p !== PLAN_NAMES.free);
  const t = AGENTS_SECTION.sheet;

  return (
    <div className="flex flex-col gap-8 pb-2 pt-1">
      <div className="flex items-center gap-5 sm:gap-7">
        <AgentBlob
          agent={agent.id}
          size={168}
          alive
          labelled
          className="h-[120px] w-[120px] sm:h-[168px] sm:w-[168px]"
        />
        <div className="min-w-0">
          <p className="t-label">{agent.area}</p>
          <h3 className="t-title mt-2">{agent.name}</h3>
        </div>
      </div>

      <p className="t-lead -mt-2 text-ink">{agent.line}</p>

      <section aria-label={t.does}>
        <p className="t-label">{t.does}</p>
        <ul className="mt-4 flex flex-col gap-2.5 light:gap-0">
          {agent.tasks.map((task) => (
            <li key={task} className="t-body text-ink light:border-b light:border-line light:py-3 light:first:pt-0">
              {task}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={t.never}>
        <p className="t-label">{t.never}</p>
        <p className="t-body mt-3 text-ink">{agent.never}</p>
      </section>

      <section aria-label={t.plan}>
        <p className="t-label">{t.plan}</p>
        <p className="t-body mt-3 text-ink">{joinPlans(plans)}</p>
        {soonPlans.length > 0 && (
          <p className="t-status mt-2">
            {joinPlans(soonPlans)}: {PRICING.soon}
          </p>
        )}
      </section>

      <div>
        <a href="#precios" onClick={onSeePlans} className={buttonClasses("secondary", "lg", "-ml-[18px] light:ml-0")}>
          Ver precios
        </a>
      </div>
    </div>
  );
}
