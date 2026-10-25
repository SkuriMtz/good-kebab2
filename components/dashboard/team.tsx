import { Link } from "next-view-transitions";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AgentBlob } from "@/components/brand/agent-blob";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LINEA_AGENTE, textoBloqueado } from "./plan";
import { hrefAgente, type Rutas } from "./rutas";
import type { TableroData } from "./types";

/** "Conoce a tu equipo": los cuatro personajes. Los que no vienen en el plan, con candado. */
export function Team({ data, rutas }: { data: TableroData; rutas: Rutas }) {
  return (
    <section aria-labelledby="equipo-titulo">
      <h2 id="equipo-titulo" className="t-h3">
        Conoce a tu equipo
      </h2>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((a) => {
          const libre = data.disponibles.includes(a.id);
          return (
            <li key={a.id} className="card flex gap-5 sm:flex-col sm:gap-6">
              <AgentBlob
                agent={a.id}
                size={112}
                alive={libre}
                labelled
                className={cn("-ml-1.5 h-[76px] w-[76px] sm:-ml-2 sm:h-28 sm:w-28", !libre && "opacity-40")}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-app-fg-2 light:normal-case light:tracking-normal">
                  {a.area}
                </p>
                <h3 className="mt-1 text-[1.75rem] font-normal leading-none tracking-[-0.03em] text-app-fg light:text-[1.5rem] light:font-semibold light:tracking-[-0.01em]">
                  {a.name}
                </h3>
                <p className="mt-3 text-[0.9375rem] font-light leading-snug text-app-fg-2 light:font-normal">
                  {LINEA_AGENTE[a.id]}
                </p>
                <div className="-ml-4 mt-5 sm:mt-auto sm:pt-5 light:ml-0">
                  {libre ? (
                    <Link href={hrefAgente(rutas, a.id)} className={buttonClasses("secondary", "md", "h-11 md:h-10")}>
                      Hablar con {a.name}
                    </Link>
                  ) : (
                    <p className="inline-flex h-11 items-center gap-2 text-[0.875rem] text-app-fg-2 md:h-10">
                      <Icon name="lock" size={16} />
                      {textoBloqueado(a.id, data.plan)}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
