import { AGENTS, getAgent, type AgentId } from "@/lib/agents";

export type CommandId = "agendar" | "resumir" | "investigar" | "redactar" | "recordar" | "reporte";

export type ChatCommand = {
  id: CommandId;
  /** Como se escribe: "/agendar". */
  nombre: string;
  agent: AgentId;
  descripcion: string;
  /** Línea de estado mientras el agente trabaja. */
  estado: string;
  /** Instrucción para el agente (solo servidor). */
  instruccion: string;
};

/** textos.md §9: comando, agente y descripción. */
export const COMMANDS: ChatCommand[] = [
  {
    id: "agendar",
    nombre: "/agendar",
    agent: "lola",
    descripcion: "Crea o mueve una cita",
    estado: "Lola está revisando tu agenda",
    instruccion:
      "La persona usó /agendar: quiere crear o mover una cita. Pide los datos que falten (cliente, día, hora, tipo de sesión) y prepara la propuesta de cita para que la apruebe. No confirmes nada por tu cuenta.",
  },
  {
    id: "resumir",
    nombre: "/resumir",
    agent: "clara",
    descripcion: "Resume un correo o conversación",
    estado: "Clara está leyendo y resumiendo",
    instruccion:
      "La persona usó /resumir: quiere el resumen de un correo o de una conversación. Resume solo lo que ella te pegó o adjuntó, marca lo urgente y las fechas límite. Si no hay texto que resumir, pídelo.",
  },
  {
    id: "investigar",
    nombre: "/investigar",
    agent: "iris",
    descripcion: "Compara precios o proveedores por ti",
    estado: "Iris está comparando opciones",
    instruccion:
      "La persona usó /investigar: quiere comparar precios o proveedores. No tienes acceso a internet ni a precios reales: explica qué datos necesitas, cómo conviene compararlos y arma la tabla con lo que ella te dé. No inventes cifras.",
  },
  {
    id: "redactar",
    nombre: "/redactar",
    agent: "iris",
    descripcion: "Escribe una carta o mensaje",
    estado: "Iris está redactando",
    instruccion:
      "La persona usó /redactar: quiere una carta o un mensaje. Entrega un primer borrador listo para usar y ofrece ajustarlo (más corto, más cálido). Recuerda que aún no se ha enviado nada.",
  },
  {
    id: "recordar",
    nombre: "/recordar",
    agent: "lola",
    descripcion: "Programa un aviso para después",
    estado: "Lola está programando el aviso",
    instruccion:
      "La persona usó /recordar: quiere un aviso para después. Confirma qué hay que recordar, para quién y cuándo. Aclara que en esta versión no puedes programar envíos automáticos: deja el recordatorio redactado.",
  },
  {
    id: "reporte",
    nombre: "/reporte",
    agent: "iris",
    descripcion: "Arma el resumen del mes",
    estado: "Iris está armando el reporte",
    instruccion:
      "La persona usó /reporte: quiere el resumen del mes. Sin datos del negocio no inventes cifras: pide lo que necesitas (citas, ingresos, clientes nuevos) y deja armada la estructura del reporte.",
  },
];

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function findCommand(word: string): ChatCommand | undefined {
  const w = norm(word.replace(/^\//, ""));
  return COMMANDS.find((c) => c.id === w);
}

/** "/agendar sesión con Marta" → { command, resto: "sesión con Marta" } */
export function parseCommand(text: string): { command: ChatCommand; resto: string } | null {
  const m = /^\s*\/([\p{L}]+)(?:\s+([\s\S]*))?$/u.exec(text);
  if (!m) return null;
  const command = findCommand(m[1]);
  return command ? { command, resto: (m[2] ?? "").trim() } : null;
}

/** "@clara resume esto" → { agent: "clara", resto: "resume esto" } (solo al inicio). */
export function parseMention(text: string): { agent: AgentId; resto: string } | null {
  const m = /^\s*@([\p{L}]+)(?:\s+([\s\S]*))?$/u.exec(text);
  if (!m) return null;
  const w = norm(m[1]);
  const agent = AGENTS.find((a) => norm(a.name) === w || a.id === w);
  return agent ? { agent: agent.id, resto: (m[2] ?? "").trim() } : null;
}

/** Línea de estado mientras trabaja un agente. */
export function workingStatus(agent: AgentId, command?: ChatCommand | null): string {
  if (command && command.agent === agent) return command.estado;
  return `${getAgent(agent).name} está trabajando en tu pedido`;
}
