import { AGENTS, agentsForPlan, type AgentId, type PlanId } from "@/lib/agents";

/**
 * Agentes que la persona puede usar. Free y One traen los suyos; en Max vienen
 * los cuatro y, si ya eligió su equipo, solo esos.
 */
export function allowedAgents(plan: PlanId, equipo: AgentId[] = []): AgentId[] {
  const base = agentsForPlan(plan);
  const chosen = plan === "max" && equipo.length > 0 ? base.filter((a) => equipo.includes(a)) : base;
  return AGENTS.map((a) => a.id).filter((id) => chosen.includes(id));
}
