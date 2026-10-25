import type { AgentId } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";
import { cn } from "@/lib/cn";

/** Uno o dos personajes (grupos): el segundo asoma por detrás del primero. */
export function AgentStack({ agentes, size = 40, className }: { agentes: AgentId[]; size?: number; className?: string }) {
  const [a, b] = agentes;
  if (!b) return <AgentBlob agent={a ?? "lola"} size={size} className={className} />;
  const small = Math.round(size * 0.72);
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }} aria-hidden="true">
      <AgentBlob agent={a} size={small} className="absolute left-0 top-0" />
      <AgentBlob agent={b} size={small} className="absolute bottom-0 right-0" />
    </span>
  );
}
