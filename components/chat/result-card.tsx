"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AgentId } from "@/lib/agents";
import type { ResultCard } from "@/lib/db/types";
import { Icon, type IconName } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";

const ICON: Record<ResultCard["tipo"], IconName> = {
  cita: "calendar",
  correo: "mail",
  archivo: "file",
  aviso: "bell",
};

// Botón tintado con el color del agente (no es el botón principal de la pantalla).
// En claro el texto va en tinta: los tonos de Lola y Víctor no alcanzan contraste sobre blanco.
const TINT: Record<AgentId | "ninguno", string> = {
  lola: "bg-agent-lola/15 text-agent-lola hover:bg-agent-lola/25 active:bg-agent-lola/30 light:bg-agent-lola/20 light:text-chat-fg light:hover:bg-agent-lola/35",
  clara: "bg-agent-clara/15 text-agent-clara hover:bg-agent-clara/25 active:bg-agent-clara/30 light:bg-agent-clara/15 light:text-chat-fg light:hover:bg-agent-clara/25",
  victor: "bg-agent-victor/15 text-agent-victor hover:bg-agent-victor/25 active:bg-agent-victor/30 light:bg-agent-victor/15 light:text-chat-fg light:hover:bg-agent-victor/25",
  iris: "bg-agent-iris/15 text-agent-iris hover:bg-agent-iris/25 active:bg-agent-iris/30 light:bg-agent-iris/15 light:text-chat-fg light:hover:bg-agent-iris/25",
  ninguno: "bg-chat-fg/10 text-chat-fg hover:bg-chat-fg/15 active:bg-chat-fg/20",
};

type Props = {
  card: ResultCard;
  agent: AgentId | null;
  /** Qué pasa al tocar el botón. Si falla, el botón vuelve a quedar disponible. */
  onAction?: (card: ResultCard) => Promise<void> | void;
};

/**
 * Tarjeta de resultado (cita agendada, correo resumido, archivo listo, aviso).
 * Oscuro: texto que flota sobre negro, el ícono y el espacio hacen de estructura.
 * Claro: tarjeta #f5f5f7 de 28px, sin sombra ni borde.
 */
export function ResultCardView({ card, agent, onAction }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const run = async () => {
    if (state !== "idle") return;
    setState("loading");
    try {
      await onAction?.(card);
      setState("done");
    } catch {
      setState("idle");
    }
  };

  return (
    <div className="mt-5 flex max-w-[540px] gap-3.5 rounded-card light:bg-chat-card light:p-5 sm:gap-4 sm:light:p-7" data-tipo={card.tipo}>
      <Icon name={ICON[card.tipo]} size={26} strokeWidth={1.5} className="mt-0.5 shrink-0 text-chat-fg-2" />
      <div className="min-w-0 flex-1">
        {card.pendiente && <p className="t-status mb-1.5">Espera tu visto bueno</p>}
        <p className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-chat-fg">{card.titulo}</p>
        {card.detalle && (
          <p className="mt-1.5 text-[1rem] font-normal leading-relaxed text-chat-fg-2">{card.detalle}</p>
        )}
        {card.accion && (
          <div aria-live="polite" className="mt-5">
            <button
              type="button"
              disabled={state !== "idle"}
              onClick={run}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-control px-5 text-[0.875rem] font-semibold uppercase tracking-[0.025em]",
                "light:text-[1rem] light:font-normal light:normal-case light:tracking-[-0.022em]",
                "transition-[background-color,color,transform] duration-200 ease-out active:translate-y-px disabled:cursor-default",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand",
                TINT[agent ?? "ninguno"],
              )}
            >
              {state === "loading" ? (
                <>
                  <Spinner />
                  <span>{card.pendiente ? "Aprobando…" : "Un momento…"}</span>
                </>
              ) : state === "done" ? (
                <>
                  <Icon name="check" size={18} strokeWidth={2} />
                  <span>{card.pendiente ? "Aprobado" : "Listo"}</span>
                </>
              ) : (
                card.accion
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
