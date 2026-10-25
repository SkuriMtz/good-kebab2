import { cache } from "react";
import { AGENTS, type AgentId, type PlanId } from "@/lib/agents";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Actividad, Conversation, Grupo } from "@/lib/db/types";
import { consultaUsoDelMes } from "@/lib/db/uso";
import { formatoDia, formatoHora } from "@/components/dashboard/format";
import { agentesDisponibles } from "@/components/dashboard/plan";
import type { EstadoActividad, TableroData } from "@/components/dashboard/types";

/**
 * Consultas de SOLO LECTURA del panel real. Todo pasa por la sesión de la persona
 * (RLS): cada quien ve únicamente lo suyo. El uso del mes sale de `uso_mensual`.
 */

export type PanelResultado =
  | { estado: "ok"; data: TableroData }
  | { estado: "sin_configurar" }
  | { estado: "sin_sesion" };

const PLANES: PlanId[] = ["free", "one", "max"];
const ESTADOS: EstadoActividad[] = ["listo", "espera", "aviso"];
const IDS_AGENTE = AGENTS.map((a) => a.id);

const esAgente = (v: unknown): v is AgentId => IDS_AGENTE.includes(v as AgentId);
const soloAgentes = (v: unknown): AgentId[] => (Array.isArray(v) ? v.filter(esAgente) : []);

/** Una sola carga por petición, la compartan el marco y la página. */
export const cargarPanel = cache(async (): Promise<PanelResultado> => {
  const sb = getServerSupabase();
  if (!sb) return { estado: "sin_configurar" };

  let userId: string | undefined;
  let email: string | null = null;
  try {
    const { data } = await sb.auth.getClaims();
    userId = data?.claims?.sub;
    email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  } catch {
    return { estado: "sin_sesion" };
  }
  if (!userId) return { estado: "sin_sesion" };

  let incompleto = false;
  /** Si una consulta falla (p. ej. falta aplicar la migración), el panel abre con lo que sí hay. */
  const leer = <T>(r: { data: unknown; error: unknown }, vacio: T): T => {
    if (r.error) incompleto = true;
    return (r.data as T | null) ?? vacio;
  };

  const [perfilR, limitesR, usadosR, actividadR, gruposR, conversacionesR] = await Promise.all([
    sb.from("profiles").select("nombre, negocio, plan, equipo").eq("id", userId).maybeSingle(),
    sb.from("plan_limits").select("plan, mensajes_mes"),
    consultaUsoDelMes(sb, userId),
    sb
      .from("actividad")
      .select("id, agente, accion, estado, detalle, created_at")
      .order("created_at", { ascending: false })
      .limit(60),
    sb.from("grupos").select("id, nombre, agentes").order("created_at", { ascending: true }),
    sb
      .from("conversations")
      .select("id, titulo, tipo, agentes, updated_at, messages(contenido, created_at)")
      .order("updated_at", { ascending: false })
      .limit(8)
      .order("created_at", { referencedTable: "messages", ascending: false })
      .limit(1, { referencedTable: "messages" }),
  ]);

  const perfil = leer<{ nombre: string | null; negocio: string | null; plan: string; equipo: unknown } | null>(
    perfilR,
    null,
  );
  const plan: PlanId = PLANES.includes(perfil?.plan as PlanId) ? (perfil?.plan as PlanId) : "free";
  const equipo = soloAgentes(perfil?.equipo);

  const limites = leer(limitesR, [] as { plan: PlanId; mensajes_mes: number }[]);
  const limite = limites.find((l) => l.plan === plan)?.mensajes_mes ?? null;
  if (usadosR.error) incompleto = true;

  const ahora = new Date();
  const actividad = leer(
    actividadR,
    [] as Pick<Actividad, "id" | "agente" | "accion" | "estado" | "detalle" | "created_at">[],
  )
    .filter((a) => esAgente(a.agente))
    .map((a) => {
      const cuando = new Date(a.created_at);
      return {
        id: a.id,
        agente: a.agente,
        accion: a.accion,
        estado: ESTADOS.includes(a.estado) ? a.estado : ("listo" as EstadoActividad),
        detalle: a.detalle,
        hora: formatoHora(cuando),
        dia: formatoDia(cuando, ahora),
      };
    });

  const grupos = leer(gruposR, [] as Pick<Grupo, "id" | "nombre" | "agentes">[]).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    agentes: soloAgentes(g.agentes),
  }));

  type FilaConversacion = Pick<Conversation, "id" | "titulo" | "tipo" | "agentes"> & {
    messages?: { contenido: string }[];
  };
  const conversaciones = leer(conversacionesR, [] as FilaConversacion[]).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    tipo: c.tipo,
    agentes: soloAgentes(c.agentes),
    ultimo: c.messages?.[0]?.contenido?.replace(/\s+/g, " ").trim().slice(0, 140) || null,
  }));

  return {
    estado: "ok",
    data: {
      base: "",
      demo: false,
      nombre: perfil?.nombre?.trim() || null,
      negocio: perfil?.negocio?.trim() || null,
      email,
      plan,
      disponibles: agentesDisponibles(plan, equipo),
      usados: typeof usadosR.data?.mensajes === "number" ? usadosR.data.mensajes : 0,
      limite,
      actividad,
      grupos,
      conversaciones,
      incompleto,
    },
  };
});

/** A dónde mandar a quien no puede ver el panel. */
export function destinoSinPanel(estado: "sin_configurar" | "sin_sesion", ruta = "/panel") {
  return estado === "sin_configurar" ? "/entrar?error=no_configurado" : `/entrar?next=${encodeURIComponent(ruta)}`;
}
