"use client";

import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { AGENTS, getAgent } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useChat } from "./chat-context";
import { AgentStack } from "./agent-stack";
import { ConversationRow } from "./conversation-row";

const rowShell =
  "group flex min-h-[64px] items-center gap-3.5 rounded-[20px] px-3 py-2.5 transition-[color,background-color,transform] duration-200 ease-out active:translate-y-px " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand";
const rowTitle = "block truncate text-[1.125rem] font-normal leading-snug transition-colors duration-200 text-ink-2 group-hover:text-chat-fg light:font-medium light:text-chat-fg";
const rowSub = "mt-0.5 block truncate text-[0.875rem] font-normal leading-snug text-chat-fg-2";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-8 shrink-0">
      <h2 id={id} className="t-status mb-2 px-3 light:text-chat-fg-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Lista lateral: volver al panel, nueva conversación, grupos, agentes y conversaciones recientes.
 * Oscuro: texto sobre negro, sin cajas ni líneas. Claro: panel #f5f5f7 con la fila activa en blanco.
 */
export function ConversationList({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { mode, basePath, backHref, allowed, groups, conversations, activeId, removeConversation } = useChat();
  const demo = mode === "demo";
  // La lista se pinta dos veces (lateral y hoja del celular): los ids no se pueden repetir.
  const pre = compact ? "hoja-" : "lateral-";

  return (
    <nav
      aria-label="Tus conversaciones"
      data-lenis-prevent
      className={cn("flex flex-col", compact ? "pt-2" : "h-full overflow-y-auto overscroll-contain px-4 pb-8 pt-3")}
    >
      <Link
        href={backHref}
        onClick={onNavigate}
        className="t-nav -ml-1 inline-flex min-h-[44px] w-fit shrink-0 items-center gap-2 rounded-full px-3 text-ink-3 transition-colors duration-200 hover:text-chat-fg light:text-chat-fg-2 light:hover:text-chat-fg"
      >
        <Icon name="arrowLeft" size={18} />
        {demo ? "Volver al panel de ejemplo" : "Volver al panel"}
      </Link>

      <Link
        href={basePath}
        onClick={onNavigate}
        className={buttonClasses(
          "secondary",
          "lg",
          "mt-4 w-full shrink-0 gap-2.5 dark:bg-chat-pill dark:text-chat-fg dark:hover:bg-chat-fg/[0.14] dark:active:bg-chat-fg/[0.1]",
        )}
      >
        <Icon name="plus" size={18} />
        Nueva conversación
      </Link>

      <Section id={`${pre}lista-grupos`} title="Grupos">
        <ul className="flex flex-col">
          {groups.map((g) => {
            const locked = g.agentes.some((a) => !allowed.includes(a));
            const names = g.agentes.map((a) => getAgent(a).name).join(" + ");
            const inner = (
              <>
                <AgentStack agentes={g.agentes} size={42} className={locked ? "opacity-50 grayscale" : undefined} />
                <span className="min-w-0 flex-1">
                  <span className={cn(rowTitle, locked && "opacity-60")}>{g.nombre}</span>
                  <span className={cn(rowSub, locked && "opacity-60")}>{locked ? "No viene en tu plan" : names}</span>
                </span>
                {locked && <Icon name="lock" size={18} className="shrink-0 text-chat-fg-2" />}
              </>
            );
            return (
              <li key={g.id}>
                {locked ? (
                  <div aria-disabled="true" className={cn(rowShell, "cursor-not-allowed")}>
                    {inner}
                  </div>
                ) : (
                  <Link
                    href={g.hilo ? `${basePath}/${g.hilo}` : `${basePath}?grupo=${g.id}`}
                    onClick={onNavigate}
                    className={cn(rowShell, "light:hover:bg-chat-hover")}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section id={`${pre}lista-agentes`} title="Agentes">
        {compact ? (
          // En celular los cuatro agentes caben en una sola fila: así "Recientes" queda a la vista.
          <ul className="grid grid-cols-4 gap-1">
            {AGENTS.map((a) => {
              const locked = !allowed.includes(a.id);
              const inner = (
                <>
                  <AgentBlob agent={a.id} size={50} className={locked ? "opacity-50 grayscale" : undefined} />
                  <span className={cn("flex items-center gap-1 text-[1rem] leading-none", locked ? "text-chat-fg-2" : "text-chat-fg")}>
                    {a.name}
                    {locked && (
                      <>
                        <Icon name="lock" size={14} />
                        <span className="sr-only">No viene en tu plan</span>
                      </>
                    )}
                  </span>
                </>
              );
              const shell = "group flex min-h-[92px] flex-col items-center gap-2.5 rounded-[20px] px-1 py-3.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand";
              return (
                <li key={a.id}>
                  {locked ? (
                    <div aria-disabled="true" className={cn(shell, "cursor-not-allowed")}>
                      {inner}
                    </div>
                  ) : (
                    <Link href={`${basePath}?agente=${a.id}`} onClick={onNavigate} className={cn(shell, "light:hover:bg-chat-hover")}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="flex flex-col">
            {AGENTS.map((a) => {
              const locked = !allowed.includes(a.id);
              const inner = (
                <>
                  <AgentBlob agent={a.id} size={42} className={locked ? "opacity-50 grayscale" : undefined} />
                  <span className="min-w-0 flex-1">
                    <span className={cn(rowTitle, locked && "opacity-60")}>{a.name}</span>
                    <span className={cn(rowSub, locked && "opacity-60")}>{locked ? "No viene en tu plan" : a.area}</span>
                  </span>
                  {locked && <Icon name="lock" size={18} className="shrink-0 text-chat-fg-2" />}
                </>
              );
              return (
                <li key={a.id}>
                  {locked ? (
                    <div aria-disabled="true" className={cn(rowShell, "cursor-not-allowed")}>
                      {inner}
                    </div>
                  ) : (
                    <Link href={`${basePath}?agente=${a.id}`} onClick={onNavigate} className={cn(rowShell, "light:hover:bg-chat-hover")}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section id={`${pre}lista-recientes`} title="Recientes">
        {conversations.length === 0 ? (
          <p className="px-3 text-[1rem] leading-relaxed text-chat-fg-2">
            Aún no tienes conversaciones. Escribe tu primer pedido y aparecerá aquí.
          </p>
        ) : (
          <ul className="flex flex-col">
            {conversations.map((c) => (
              <ConversationRow
                key={c.id}
                item={c}
                href={`${basePath}/${c.id}`}
                active={c.id === activeId}
                onDelete={removeConversation}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </Section>

      {demo && <p className="t-status mt-auto shrink-0 px-3 pt-10 lg:hidden light:text-chat-fg-2">Datos de ejemplo</p>}
    </nav>
  );
}
