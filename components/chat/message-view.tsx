"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getAgent } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Icon } from "@/components/ui/icon";
import { formatHora, splitAttachment } from "@/lib/chat/format";
import type { ResultCard } from "@/lib/db/types";
import type { ChatMessage } from "@/lib/chat/types";
import { ResultCardView } from "./result-card";

/** Hora del mensaje. Las de la base se formatean en el navegador (zona horaria de la persona). */
function Hora({ m, className }: { m: ChatMessage; className?: string }) {
  const [texto, setTexto] = useState(m.hora ?? "");
  useEffect(() => {
    if (m.hora) return;
    const d = new Date(m.created_at);
    if (!Number.isNaN(d.getTime())) setTexto(formatHora(d));
  }, [m.hora, m.created_at]);
  if (!texto) return null;
  return <span className={cn("text-[0.875rem] font-normal text-chat-fg-2", className)}>{texto}</span>;
}

type Props = {
  message: ChatMessage;
  previous?: ChatMessage;
  /** El mensaje se está escribiendo ahora mismo. */
  streaming?: boolean;
  onCardAction?: (card: ResultCard, message: ChatMessage) => Promise<void> | void;
};

export function MessageView({ message: m, previous, streaming, onCardAction }: Props) {
  if (m.rol === "sistema") {
    return (
      <p className="flex items-center justify-center gap-2 text-center text-[0.9375rem] font-normal text-chat-fg-2">
        <Icon name="arrowRight" size={16} />
        {m.contenido}
      </p>
    );
  }

  if (m.rol === "usuario") {
    const { texto, adjunto } = splitAttachment(m.contenido);
    return (
      <div className="flex flex-col items-end">
        {m.autor && (
          <p className="mb-1.5 mr-1 flex items-baseline gap-2 text-[0.875rem] text-chat-fg-2">
            <span className="font-semibold text-chat-fg">{m.autor}</span>
            <Hora m={m} />
          </p>
        )}
        <div className="max-w-[88%] rounded-[24px] bg-chat-pill px-5 py-3 text-[1.0625rem] font-normal leading-[1.55] text-chat-fg sm:max-w-[80%]">
          {texto && <p className="whitespace-pre-wrap break-words">{texto}</p>}
          {adjunto && (
            <p className={cn("flex items-center gap-2 text-[0.9375rem] text-chat-fg-2", texto && "mt-2")}>
              <Icon name="paperclip" size={16} className="shrink-0" />
              <span className="min-w-0 truncate">{adjunto}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  const agente = m.agente ? getAgent(m.agente) : null;
  const showHeader = !previous || previous.rol !== "agente" || previous.agente !== m.agente;

  return (
    <article aria-label={agente ? `${agente.name} dice` : "Mensaje"} className={cn(!showHeader && "-mt-3")}>
      {showHeader && agente && (
        <header className="mb-2 flex items-center gap-2.5">
          <AgentBlob agent={agente.id} size={30} alive={streaming} />
          <span className="text-[1rem] font-semibold text-chat-fg">{agente.name}</span>
          <Hora m={m} />
        </header>
      )}
      {m.contenido && (
        <p className="whitespace-pre-wrap break-words text-[1.125rem] leading-[1.6] text-chat-fg light:font-normal">
          {m.contenido}
        </p>
      )}
      {m.nota && <p className="mt-2 text-[0.875rem] font-normal text-chat-fg-2">{m.nota}</p>}
      {m.tarjeta && !streaming && (
        <ResultCardView card={m.tarjeta} agent={m.agente} onAction={onCardAction ? (c) => onCardAction(c, m) : undefined} />
      )}
    </article>
  );
}
