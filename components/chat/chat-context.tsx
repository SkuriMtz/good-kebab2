"use client";

import { createContext, useContext } from "react";
import type { AgentId, PlanId } from "@/lib/agents";
import type { ChatMessage, ChatMode, ConversationSummary, GroupSummary } from "@/lib/chat/types";

export type ChatContextValue = {
  mode: ChatMode;
  /** "/pruebalo/chat" o "/chat". */
  basePath: string;
  /** Enlace de regreso al panel. */
  backHref: string;
  userName: string | null;
  plan: PlanId;
  /** Agentes que vienen en el plan. */
  allowed: AgentId[];
  /** Conversaciones visibles (sin las que están por borrarse). */
  conversations: ConversationSummary[];
  groups: GroupSummary[];
  /** Id de la conversación abierta, si hay. */
  activeId: string | null;
  openList: () => void;
  /** Agrega o actualiza una fila de la lista. */
  upsertConversation: (c: ConversationSummary) => void;
  /** Borra con opción de deshacer. */
  removeConversation: (id: string) => void;
  addGroup: (g: GroupSummary) => void;
  /** Ejemplo: guarda en memoria los mensajes de una conversación para no perderlos al cambiar de chat. */
  getThread: (id: string) => ChatMessage[] | undefined;
  setThread: (id: string, messages: ChatMessage[]) => void;
  /** En vivo: vuelve a pedir la lista al servidor. */
  refreshList: () => void;
};

const Ctx = createContext<ChatContextValue | null>(null);

export const ChatProvider = Ctx.Provider;

export function useChat(): ChatContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useChat debe usarse dentro de <ChatFrame>");
  return v;
}
