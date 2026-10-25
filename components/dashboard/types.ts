import type { AgentId, PlanId } from "@/lib/agents";

/**
 * Datos del panel ya listos para pintar. Los usan igual /pruebalo (lib/demo/tablero.ts)
 * y /panel (lib/db/panel.ts), así que son simples y se pueden mandar de servidor a cliente:
 * las horas ya vienen escritas ("11:05 am").
 */

export type EstadoActividad = "listo" | "espera" | "aviso";

export type FilaActividad = {
  id: string;
  agente: AgentId;
  accion: string;
  estado: EstadoActividad;
  /** Si se manda, reemplaza el texto del estado (p. ej. "Aprobado por Ana"). */
  estadoTexto?: string;
  detalle?: string | null;
  /** "11:05 am" */
  hora: string;
  /** "Hoy", "Ayer" o "12 de octubre" */
  dia: string;
};

export type FilaGrupo = {
  id: string;
  nombre: string;
  agentes: AgentId[];
  descripcion?: string;
  /** Solo en el ejemplo: conversación ya hecha del grupo, para abrirla directo. */
  hilo?: string;
};

export type FilaConversacion = {
  id: string;
  titulo: string;
  agentes: AgentId[];
  tipo: "agente" | "grupo";
  ultimo?: string | null;
};

export type TableroData = {
  /** Prefijo de las rutas: "/pruebalo" en la demostración, "" en el panel real. */
  base: "" | "/pruebalo";
  demo: boolean;
  nombre: string | null;
  negocio: string | null;
  email: string | null;
  plan: PlanId;
  /** Agentes que la persona puede usar con su plan (y su equipo, en Max). */
  disponibles: AgentId[];
  /** Mensajes que escribió este mes. */
  usados: number;
  /** Mensajes al mes de su plan; null si la base aún no tiene el dato. */
  limite: number | null;
  actividad: FilaActividad[];
  grupos: FilaGrupo[];
  conversaciones: FilaConversacion[];
  /** true si alguna consulta falló y faltan datos. */
  incompleto?: boolean;
};

/** Lo que necesitan la barra y el lateral (la actividad completa solo la piden las páginas). */
export type ShellData = Omit<TableroData, "actividad"> & {
  /** Actividad que espera a la persona (estado "espera" o "aviso"). */
  avisos: FilaActividad[];
};
