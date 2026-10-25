import { AGENTS, PLANS, type AgentId, type PlanId } from "@/lib/agents";

/**
 * Agentes que puede usar una persona. Free y One traen los suyos fijos;
 * en Max elige su equipo (`equipo`), y si aún no eligió, tiene los cuatro.
 */
export function agentesDisponibles(plan: PlanId, equipo: AgentId[] = []): AgentId[] {
  const delPlan: AgentId[] = PLANS.find((p) => p.id === plan)?.agents ?? ["clara"];
  const elegidos = plan === "max" && equipo.length > 0 ? equipo : delPlan;
  return AGENTS.map((a) => a.id).filter((id) => delPlan.includes(id) && elegidos.includes(id));
}

export const NOMBRE_PLAN: Record<PlanId, string> = { free: "Free", one: "One", max: "Max" };

/** Por qué un agente está bloqueado: en qué plan está, o que no entró al equipo. */
export function textoBloqueado(agente: AgentId, plan: PlanId): string {
  if (plan === "max") return "No está en tu equipo";
  return agente === "lola" ? "Disponible en One y Max" : "Disponible en Max";
}

/** Línea corta de cada agente (textos.md §3). */
export const LINEA_AGENTE: Record<AgentId, string> = {
  lola: "Contesta tu WhatsApp a cualquier hora.",
  clara: "Resume tu correo y marca lo urgente.",
  victor: "Trae de regreso a quien dejó de venir.",
  iris: "Redacta, compara y arma tus reportes.",
};
