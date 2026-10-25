export type AgentId = "lola" | "clara" | "victor" | "iris";

export type Agent = {
  id: AgentId;
  name: string;
  area: string;
  /** Una línea de lo que hace (docs/investigacion/textos.md §3). La leen la portada, el panel y el chat. */
  line: string;
  /** Lo que hace, en verbos (para la ficha). */
  tasks: string[];
  /** Lo que no hace sin el permiso del dueño, como objeto de "Nunca sin tu permiso:" (termina en punto). */
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
    line: "Contesta tu WhatsApp a cualquier hora.",
    tasks: [
      "Responde precios, horarios y formas de pago",
      "Agenda y confirma citas",
      "Recuerda la cita a tu cliente",
      "Reagenda cuando alguien no puede",
      "Te avisa cuando un caso necesita a una persona",
    ],
    never: "Dar un descuento o cambiar un precio.",
    color: "rgb(var(--agent-lola))",
    hex: { dark: "#ffb829", light: "#f2a20c" },
    plan: "one",
  },
  {
    id: "clara",
    name: "Clara",
    area: "Correo",
    line: "Resume tu correo y marca lo urgente.",
    tasks: [
      "Lee el correo del día",
      "Lo resume",
      "Lo ordena por urgencia",
      "Detecta facturas y su fecha límite",
      "Propone respuestas",
    ],
    never: "Enviar una respuesta.",
    color: "rgb(var(--agent-clara))",
    hex: { dark: "#1fb89a", light: "#15846e" },
    plan: "free",
  },
  {
    id: "victor",
    name: "Víctor",
    area: "Clientes",
    line: "Trae de regreso a quien dejó de venir.",
    tasks: [
      "Busca a quien no viene desde hace tiempo",
      "Escribe un mensaje personal",
      "Da seguimiento a quien preguntó y no agendó",
      "Pide reseñas",
    ],
    never: "Mandar un mensaje a tus clientes.",
    color: "rgb(var(--agent-victor))",
    hex: { dark: "#ff5a8a", light: "#e8396c" },
    plan: "max",
  },
  {
    id: "iris",
    name: "Iris",
    area: "Oficina",
    line: "Redacta, compara y arma tus reportes.",
    tasks: [
      "Redacta documentos, cartas y resúmenes",
      "Arma el reporte del mes",
      "Compara precios y proveedores",
      "Explica trámites con palabras claras",
    ],
    never: "Enviar un documento.",
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
