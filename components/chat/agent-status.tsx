import { cn } from "@/lib/cn";
import { getAgent, type AgentId } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";

// Clases estáticas para que Tailwind las vea. En claro el texto se oscurece con color-mix
// (los tonos de Lola y Víctor no alcanzan contraste sobre blanco); el punto conserva el color puro.
const TEXT: Record<AgentId, string> = {
  lola: "text-agent-lola light:text-[color-mix(in_srgb,rgb(var(--agent-lola))_58%,black)]",
  clara: "text-agent-clara light:text-[color-mix(in_srgb,rgb(var(--agent-clara))_90%,black)]",
  victor: "text-agent-victor light:text-[color-mix(in_srgb,rgb(var(--agent-victor))_80%,black)]",
  iris: "text-agent-iris light:text-[color-mix(in_srgb,rgb(var(--agent-iris))_82%,black)]",
};
const DOT: Record<AgentId, string> = {
  lola: "bg-agent-lola",
  clara: "bg-agent-clara",
  victor: "bg-agent-victor",
  iris: "bg-agent-iris",
};

/**
 * Línea de estado del color del agente: "Lola está trabajando en tu pedido".
 * El punto pulsa suave; con "reducir movimiento" se queda quieto.
 */
export function AgentStatus({ agent, texto }: { agent: AgentId; texto: string }) {
  return (
    <p role="status" aria-live="polite" className={cn("flex items-center gap-3 text-[1.0625rem] font-semibold", TEXT[agent])}>
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className={cn("absolute inset-0 rounded-full animate-pulse [animation-duration:1.6s] motion-reduce:animate-none", DOT[agent])} />
      </span>
      <span>{texto}</span>
    </p>
  );
}

/** El agente que va a hablar: su personaje, su nombre y "escribiendo…" (tres puntos que solo cambian de opacidad). */
export function TypingIndicator({ agent }: { agent: AgentId }) {
  const a = getAgent(agent);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2.5">
        <AgentBlob agent={agent} size={30} alive />
        <span className="text-[1rem] font-semibold text-chat-fg">{a.name}</span>
      </div>
      <p role="status" aria-live="polite" className="flex items-center gap-2.5 text-[0.9375rem] font-normal text-chat-fg-2">
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-duration:1.2s] motion-reduce:animate-none"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
        </span>
        <span>{a.name} está escribiendo…</span>
      </p>
    </div>
  );
}
