import type { AgentId, PlanId } from "@/lib/agents";
import type { Message } from "@/lib/db/types";

/** demo = /pruebalo/chat (guion local) · live = /chat (sesión real e IA). */
export type ChatMode = "demo" | "live";

/** Un mensaje tal como lo pinta la interfaz (es un `Message` de la base más datos de presentación). */
export type ChatMessage = Pick<Message, "id" | "rol" | "agente" | "contenido" | "tarjeta" | "created_at"> & {
  /** Hora ya formateada (solo datos de ejemplo). Si falta, se formatea created_at en el navegador. */
  hora?: string;
  /** Nombre de quien escribe cuando no es la dueña (p. ej. el cliente del ejemplo). */
  autor?: string;
  /** Texto pequeño bajo el mensaje (p. ej. "Precio de ejemplo"). */
  nota?: string;
};

export type ConversationMeta = {
  id: string;
  titulo: string;
  tipo: "agente" | "grupo";
  agentes: AgentId[];
  grupo_id: string | null;
};

export type ConversationSummary = ConversationMeta & {
  /** Último mensaje, en una línea. */
  ultimo: string;
  updated_at: string;
};

export type GroupSummary = {
  id: string;
  nombre: string;
  agentes: AgentId[];
  descripcion?: string;
  /** Solo en el ejemplo: conversación ya hecha para abrir directo. */
  hilo?: string;
};

/** A quién le escribe la persona desde la caja. */
export type ChatTarget = { kind: "agente"; agent: AgentId } | { kind: "grupo"; groupId: string };

export type ChatUser = {
  nombre: string | null;
  negocio: string | null;
  plan: PlanId;
  equipo: AgentId[];
};

export type ChatErrorCode =
  | "sesion"
  | "limite"
  | "agente_no_incluido"
  | "no_configurado"
  | "ocupado"
  | "red"
  | "conversacion"
  | "solicitud"
  | "error";
