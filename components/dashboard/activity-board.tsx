"use client";

import { useMemo, useState } from "react";
import { AGENTS, getAgent, type AgentId } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Button } from "@/components/ui/button";
import { ActivityRow } from "./activity-row";
import { useTablero } from "./context";
import { hrefRevisar } from "./revisar";
import { EmptyActivity } from "./recent-activity";
import type { FilaActividad } from "./types";

type Filtro = AgentId | "todos";

/** Actividad completa, con filtro por agente y agrupada por día. */
export function ActivityBoard({ filas }: { filas: FilaActividad[] }) {
  const t = useTablero();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  // Filtros: los agentes del plan y cualquiera que ya tenga actividad.
  const chips = AGENTS.filter((a) => t.disponibles.includes(a.id) || filas.some((f) => f.agente === a.id));
  const lista = filtro === "todos" ? filas : filas.filter((f) => f.agente === filtro);

  const dias = useMemo(() => {
    const porDia = new Map<string, FilaActividad[]>();
    for (const f of lista) porDia.set(f.dia, [...(porDia.get(f.dia) ?? []), f]);
    return Array.from(porDia);
  }, [lista]);

  if (filas.length === 0) {
    return (
      <div className="card mt-10">
        <EmptyActivity rutas={t.rutas} />
      </div>
    );
  }

  const chip = (seleccionado: boolean) =>
    cn(
      "inline-flex h-11 items-center gap-2 rounded-control border px-4 text-[0.9375rem] transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px md:h-10",
      seleccionado
        ? "border-transparent font-semibold text-app-fg light:border-app-fg light:bg-app-fg light:font-normal light:text-app-card"
        : "border-transparent font-normal text-app-fg-2 hover:text-app-fg light:border-line-strong light:text-app-fg light:hover:bg-app-fg/[0.05]",
    );

  return (
    <div className="mt-10">
      <div
        role="group"
        aria-label="Filtrar por agente"
        className="-ml-4 flex flex-wrap gap-x-1 gap-y-1 light:ml-0 light:gap-2"
      >
        <button
          type="button"
          aria-pressed={filtro === "todos"}
          onClick={() => setFiltro("todos")}
          className={chip(filtro === "todos")}
        >
          Todos
        </button>
        {chips.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={filtro === a.id}
            onClick={() => setFiltro(a.id)}
            className={chip(filtro === a.id)}
          >
            <AgentBlob agent={a.id} size={22} />
            {a.name}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {lista.length} {lista.length === 1 ? "movimiento" : "movimientos"}
      </p>

      {lista.length === 0 ? (
        <div className="card mt-8">
          <div className="py-4">
            <p className="text-[1.0625rem] font-normal text-app-fg">
              Todavía no hay actividad de {filtro === "todos" ? "tus agentes" : getAgent(filtro).name}
            </p>
            <p className="mt-1 text-[0.9375rem] text-app-fg-2">Aquí verás lo que hacen tus agentes.</p>
            <Button variant="secondary" className="mt-5 h-11 md:h-10" onClick={() => setFiltro("todos")}>
              Ver todos
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {dias.map(([dia, items]) => (
            <section key={dia} aria-label={dia} className="card">
              <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-app-fg-2 light:normal-case light:tracking-normal">
                {dia}
              </h2>
              <ul className="mt-2 light:divide-y light:divide-app-line">
                {items.map((fila) => (
                  <ActivityRow key={fila.id} fila={fila} href={hrefRevisar(t.rutas, t.conversaciones, fila)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
