"use client";

import { useCallback, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Icon } from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { AGENTS, type Agent, type AgentId } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AGENTS_SECTION, AGENT_COPY } from "./content";
import { AgentSheetContent } from "./agent-sheet";
import { scrollToId } from "./scroll-to";

/**
 * Lista tipográfica enorme: una fila por agente. Con el mouse sobre una fila, las demás bajan a 0.3;
 * al tocar, hacer clic o dar Enter se abre la ficha. En claro hay líneas finas entre filas; en oscuro, ninguna.
 */
export function AgentsSection() {
  const [hot, setHot] = useState<AgentId | null>(null);
  const [selected, setSelected] = useState<Agent>(AGENTS[0]);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const seePlans = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollToId("precios"), 300);
  };

  return (
    <Reveal as="section" id="agentes" aria-labelledby="agentes-title" className="page-w py-section">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-8">
          <p data-r className="t-label">
            {AGENTS_SECTION.label}
          </p>
          <h2 data-r id="agentes-title" className="t-title-lg mt-5">
            {AGENTS_SECTION.title}
          </h2>
        </div>
        <p data-r className="t-lead text-ink lg:col-span-4 lg:pb-3">
          {AGENTS_SECTION.subtitle}
        </p>
      </div>

      <ul className="mt-12 lg:mt-20" onPointerLeave={() => setHot(null)}>
        {AGENTS.map((agent, i) => {
          const copy = AGENT_COPY[agent.id];
          const dim = hot !== null && hot !== agent.id;
          return (
            <li
              key={agent.id}
              data-r
              className={cn("light:border-t light:border-line", i === AGENTS.length - 1 && "light:border-b")}
            >
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  setSelected(agent);
                  setOpen(true);
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHot(agent.id);
                }}
                onFocus={(e) => {
                  if (e.currentTarget.matches(":focus-visible")) setHot(agent.id);
                }}
                onBlur={() => setHot(null)}
                className={cn(
                  "group grid w-full grid-cols-[1fr_auto] items-center gap-y-4 rounded-control py-7 text-left transition-opacity duration-300 ease-out",
                  "lg:grid-cols-12 lg:gap-x-8 lg:py-10",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand",
                  dim ? "opacity-30" : "opacity-100",
                )}
              >
                <span className="flex items-center gap-4 sm:gap-6 lg:col-span-7 lg:gap-9">
                  <AgentBlob
                    agent={agent.id}
                    size={96}
                    alive={hot === agent.id}
                    className="h-[60px] w-[60px] transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:h-[76px] sm:w-[76px] lg:h-[96px] lg:w-[96px]"
                  />
                  <span className="t-display">{agent.name}</span>
                </span>

                <span
                  aria-hidden="true"
                  className="col-start-2 row-start-1 inline-flex h-11 w-11 items-center justify-center text-ink-3 transition-[color,transform] duration-300 ease-out group-hover:translate-x-1 group-hover:text-ink lg:col-span-1 lg:col-start-12 lg:justify-self-end"
                >
                  <Icon name="arrowRight" size={24} />
                </span>

                <span className="col-span-2 row-start-2 flex flex-col gap-2 lg:col-span-4 lg:col-start-8 lg:row-start-1 lg:gap-3">
                  <span className="t-label">{agent.area}</span>
                  <span className="t-lead text-ink">{copy.line}</span>
                  <span className="sr-only">. {AGENTS_SECTION.sheet.open} {agent.name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet open={open} onClose={close} title={`${selected.name}, ${selected.area}`} side="auto">
        <AgentSheetContent agent={selected} onSeePlans={seePlans} />
      </Sheet>
    </Reveal>
  );
}
