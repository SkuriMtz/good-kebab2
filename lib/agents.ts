export type AgentId = "lola" | "clara" | "victor" | "iris";

export type Agent = {
  id: AgentId;
  name: string;
  area: string;
  /** Una línea de lo que hace. */
  line: string;
  /** Lo que hace, en verbos (para la ficha). */
  tasks: string[];
  /** Lo que nunca hace sin el visto bueno del dueño. */
  never: string;
  /** Color para CSS: respeta el modo claro/oscuro. */
  color: string;
  /** Colores en hex para canvas (oscuro, claro). */
  hex: { dark: string; light: string };
  /** Plan mínimo que lo incluye. */
  plan: "free" | "one" | "max";
};

export const AGENTS: Agent[] = [
  {
    id: "lola",
    name: "Lola",
    area: "Atención",
    line: "Contesta tu WhatsApp y agenda citas, a cualquier hora.",
    tasks: [
      "Contesta el WhatsApp a cualquier hora",
      "Responde precios, horarios y formas de pago",
      "Agenda, confirma, recuerda y reagenda citas",
      "Te avisa cuando un caso necesita a una persona",
    ],
    never: "Nunca confirma un cambio importante sin preguntarte.",
    color: "rgb(var(--agent-lola))",
    hex: { dark: "#ffb829", light: "#f2a20c" },
    plan: "one",
  },
  {
    id: "clara",
    name: "Clara",
    area: "Correo",
    line: "Te resume el correo del día y lo ordena por urgencia.",
    tasks: [
      "Lee y resume el correo del día",
      "Lo ordena por urgencia",
      "Detecta facturas y su fecha límite",
      "Te propone respuestas",
    ],
    never: "Nunca envía una respuesta sin que la apruebes.",
    color: "rgb(var(--agent-clara))",
    hex: { dark: "#1fb89a", light: "#15846e" },
    plan: "free",
  },
  {
    id: "victor",
    name: "Víctor",
    area: "Clientes",
    line: "Trae de regreso a tus clientes y pide reseñas.",
    tasks: [
      "Escribe a quien no viene desde hace tiempo, con un mensaje personal",
      "Da seguimiento a quien preguntó y no agendó",
      "Pide reseñas a quien ya vino",
    ],
    never: "Nunca le escribe a un cliente sin que veas el mensaje.",
    color: "rgb(var(--agent-victor))",
    hex: { dark: "#ff5a8a", light: "#e8396c" },
    plan: "max",
  },
  {
    id: "iris",
    name: "Iris",
    area: "Oficina",
    line: "Redacta, arma reportes y te explica trámites.",
    tasks: [
      "Redacta documentos, cartas y resúmenes",
      "Arma tu reporte del mes",
      "Compara precios y proveedores",
      "Te explica trámites paso a paso",
    ],
    never: "Nunca manda un documento a nadie sin tu visto bueno.",
    color: "rgb(var(--agent-iris))",
    hex: { dark: "#a98bff", light: "#7d5cf2" },
    plan: "max",
  },
];

export const AGENT_BY_ID: Record<AgentId, Agent> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, Agent>;

export function getAgent(id: AgentId): Agent {
  return AGENT_BY_ID[id];
}

export type PlanId = "free" | "one" | "max";

export const PLANS: { id: PlanId; name: string; agents: AgentId[] }[] = [
  { id: "free", name: "Free", agents: ["clara"] },
  { id: "one", name: "One", agents: ["clara", "lola"] },
  { id: "max", name: "Max", agents: ["lola", "clara", "victor", "iris"] },
];

export function agentsForPlan(plan: PlanId): AgentId[] {
  return PLANS.find((p) => p.id === plan)?.agents ?? ["clara"];
}
