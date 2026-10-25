import { AgentBlob } from "@/components/brand/agent-blob";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/cn";

/** Los cuatro personajes en fila, un poco encimados: firma de las páginas de formulario. */
export function TeamRow({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("flex items-end", className)} aria-hidden="true">
      {AGENTS.map((agent, i) => (
        <span
          key={agent.id}
          className="-ml-3 block transition-transform duration-500 ease-out first:ml-0 hover:-translate-y-2"
          style={{ transform: i % 2 === 1 ? "translateY(-10px)" : undefined }}
        >
          <AgentBlob agent={agent.id} size={size} alive />
        </span>
      ))}
    </div>
  );
}
