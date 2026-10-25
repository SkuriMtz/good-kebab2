/**
 * Contrato de la base de datos (Supabase). La migración en
 * supabase/migrations/ debe crear exactamente estas tablas y columnas.
 * Todas las tablas del usuario tienen RLS: cada quien ve y cambia solo lo suyo.
 */
import type { AgentId, PlanId } from "@/lib/agents";

/** profiles — una fila por usuario (se crea sola al registrarse). `plan` no lo puede cambiar el usuario. */
export type Profile = {
  id: string; // = auth.users.id
  nombre: string | null;
  negocio: string | null;
  plan: PlanId; // default 'free'
  equipo: AgentId[]; // agentes elegidos (solo cuenta en Max); default '{}'
  created_at: string;
};

/** plan_limits — mensajes al mes por plan. Los valores los define el dueño. */
export type PlanLimit = {
  plan: PlanId;
  mensajes_mes: number;
};

/** grupos — agentes que colaboran y se pasan el trabajo. */
export type Grupo = {
  id: string;
  user_id: string;
  nombre: string;
  agentes: AgentId[];
  created_at: string;
};

/** conversations — una por chat (con un agente o con un grupo). */
export type Conversation = {
  id: string;
  user_id: string;
  titulo: string;
  tipo: "agente" | "grupo";
  agentes: AgentId[];
  grupo_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Tarjeta de resultado dentro de un mensaje. */
export type ResultCard = {
  tipo: "cita" | "correo" | "archivo" | "aviso";
  titulo: string;
  detalle?: string;
  /** Texto del botón píldora, p. ej. "Aprobar y enviar". */
  accion?: string;
  /** true si espera el visto bueno del dueño. */
  pendiente?: boolean;
};

/** messages — `rol = 'usuario'` cuenta para el límite del mes (se suma en `uso_mensual`). */
export type Message = {
  id: string;
  conversation_id: string;
  user_id: string;
  rol: "usuario" | "agente" | "sistema";
  agente: AgentId | null;
  contenido: string;
  tarjeta: ResultCard | null;
  created_at: string;
};

/**
 * uso_mensual — mensajes que escribió la persona (rol = 'usuario') en cada mes. Lo suma un trigger de la
 * base al insertar en `messages`; la app solo lo lee. No baja si se borran conversaciones.
 */
export type UsoMensual = {
  user_id: string;
  /** Primer día del mes en UTC, "2026-10-01". */
  mes: string;
  mensajes: number;
};

/** actividad — lo que hicieron los agentes, para el panel. */
export type Actividad = {
  id: string;
  user_id: string;
  agente: AgentId;
  accion: string;
  estado: "listo" | "espera" | "aviso"; // espera = espera tu visto bueno; aviso = necesita a una persona
  detalle: string | null;
  created_at: string;
};

/** waitlist — solo inserción pública (sin lectura). email único en minúsculas. */
export type WaitlistEntry = {
  id: string;
  email: string;
  plan: PlanId | null;
  origen: string | null;
  created_at: string;
};

/** contact_messages — solo inserción pública (sin lectura). */
export type ContactMessage = {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  created_at: string;
};
