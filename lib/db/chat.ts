import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentId, PlanId } from "@/lib/agents";
import type { Conversation, Grupo, Message, ResultCard } from "@/lib/db/types";
import { consultaUsoDelMes } from "@/lib/db/uso";
import { oneLine } from "@/lib/chat/format";
import type { ChatMessage, ChatUser, ConversationMeta, ConversationSummary, GroupSummary } from "@/lib/chat/types";

/**
 * Acceso a datos del chat. Todas las funciones reciben el cliente de Supabase
 * (getServerSupabase() en servidor, getBrowserSupabase() en el navegador): con RLS,
 * cada persona solo ve y cambia lo suyo.
 */
type Sb = SupabaseClient;

const PLANES: PlanId[] = ["free", "one", "max"];

export async function getChatUser(sb: Sb, userId: string): Promise<ChatUser> {
  const { data } = await sb.from("profiles").select("nombre, negocio, plan, equipo").eq("id", userId).maybeSingle();
  const plan = PLANES.includes(data?.plan) ? (data?.plan as PlanId) : "free";
  return {
    nombre: (data?.nombre as string | null) ?? null,
    negocio: (data?.negocio as string | null) ?? null,
    plan,
    equipo: Array.isArray(data?.equipo) ? (data.equipo as AgentId[]) : [],
  };
}

/** Mensajes al mes del plan, o null si el dueño aún no definió el límite. */
export async function getPlanLimit(sb: Sb, plan: PlanId): Promise<number | null> {
  const { data } = await sb.from("plan_limits").select("mensajes_mes").eq("plan", plan).maybeSingle();
  return typeof data?.mensajes_mes === "number" ? data.mensajes_mes : null;
}

/** Mensajes que escribió la persona este mes, de `uso_mensual` (borrar conversaciones no lo baja). */
export async function countUserMessagesThisMonth(sb: Sb, userId: string): Promise<number> {
  const { data } = await consultaUsoDelMes(sb, userId);
  return typeof data?.mensajes === "number" ? data.mensajes : 0;
}

/* ------------------------------ Conversaciones ------------------------------ */

type ConvRow = Conversation & { messages?: { contenido: string; created_at: string }[] };

export async function listConversations(sb: Sb): Promise<ConversationSummary[]> {
  const { data } = await sb
    .from("conversations")
    .select("id, titulo, tipo, agentes, grupo_id, updated_at, messages(contenido, created_at)")
    .order("updated_at", { ascending: false })
    .limit(40)
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" });
  return ((data ?? []) as ConvRow[]).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    tipo: c.tipo,
    agentes: c.agentes ?? [],
    grupo_id: c.grupo_id,
    ultimo: oneLine(c.messages?.[0]?.contenido ?? ""),
    updated_at: c.updated_at,
  }));
}

export async function getConversation(sb: Sb, id: string): Promise<ConversationMeta | null> {
  const { data } = await sb
    .from("conversations")
    .select("id, titulo, tipo, agentes, grupo_id")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    titulo: data.titulo,
    tipo: data.tipo,
    agentes: data.agentes ?? [],
    grupo_id: data.grupo_id ?? null,
  };
}

export async function listMessages(sb: Sb, conversationId: string): Promise<ChatMessage[]> {
  const { data } = await sb
    .from("messages")
    .select("id, conversation_id, rol, agente, contenido, tarjeta, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(300);
  return ((data ?? []) as Message[]).map((m) => ({
    id: m.id,
    rol: m.rol,
    agente: m.agente,
    contenido: m.contenido,
    tarjeta: (m.tarjeta as ResultCard | null) ?? null,
    created_at: m.created_at,
  }));
}

/** Últimos mensajes para darle contexto a la IA (de más viejo a más nuevo). */
export async function recentMessages(sb: Sb, conversationId: string, limit = 30) {
  const { data } = await sb
    .from("messages")
    .select("rol, agente, contenido, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Pick<Message, "rol" | "agente" | "contenido">[]).reverse();
}

export async function createConversation(
  sb: Sb,
  input: { userId: string; titulo: string; tipo: "agente" | "grupo"; agentes: AgentId[]; grupoId: string | null },
): Promise<string | null> {
  const { data, error } = await sb
    .from("conversations")
    .insert({
      user_id: input.userId,
      titulo: input.titulo,
      tipo: input.tipo,
      agentes: input.agentes,
      grupo_id: input.grupoId,
    })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

export async function touchConversation(sb: Sb, id: string, agentes?: AgentId[]) {
  const cambios: { updated_at: string; agentes?: AgentId[] } = { updated_at: new Date().toISOString() };
  if (agentes) cambios.agentes = agentes;
  await sb.from("conversations").update(cambios).eq("id", id);
}

export async function insertMessage(
  sb: Sb,
  m: {
    conversationId: string;
    userId: string;
    rol: Message["rol"];
    agente: AgentId | null;
    contenido: string;
    tarjeta?: ResultCard | null;
  },
): Promise<boolean> {
  const { error } = await sb.from("messages").insert({
    conversation_id: m.conversationId,
    user_id: m.userId,
    rol: m.rol,
    agente: m.agente,
    contenido: m.contenido,
    tarjeta: m.tarjeta ?? null,
  });
  return !error;
}

/** Borra una conversación; sus mensajes se van con ella (on delete cascade). El uso del mes no cambia. */
export async function deleteConversation(sb: Sb, id: string): Promise<boolean> {
  const { error } = await sb.from("conversations").delete().eq("id", id);
  return !error;
}

/* ---------------------------------- Grupos ---------------------------------- */

export async function listGrupos(sb: Sb): Promise<GroupSummary[]> {
  const { data } = await sb.from("grupos").select("id, nombre, agentes").order("created_at", { ascending: true });
  return ((data ?? []) as Pick<Grupo, "id" | "nombre" | "agentes">[]).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    agentes: g.agentes ?? [],
  }));
}

export async function getGrupo(sb: Sb, id: string): Promise<GroupSummary | null> {
  const { data } = await sb.from("grupos").select("id, nombre, agentes").eq("id", id).maybeSingle();
  return data ? { id: data.id, nombre: data.nombre, agentes: data.agentes ?? [] } : null;
}

export async function createGrupo(
  sb: Sb,
  input: { userId: string; nombre: string; agentes: AgentId[] },
): Promise<GroupSummary | null> {
  const { data, error } = await sb
    .from("grupos")
    .insert({ user_id: input.userId, nombre: input.nombre, agentes: input.agentes })
    .select("id, nombre, agentes")
    .single();
  if (error || !data) return null;
  return { id: data.id, nombre: data.nombre, agentes: data.agentes ?? [] };
}
