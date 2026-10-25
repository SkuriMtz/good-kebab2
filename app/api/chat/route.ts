import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { AGENTS, getAgent, type AgentId } from "@/lib/agents";
import { aiConfig } from "@/lib/env";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  countUserMessagesThisMonth,
  createConversation,
  getChatUser,
  getGrupo,
  getPlanLimit,
  insertMessage,
  recentMessages,
  touchConversation,
} from "@/lib/db/chat";
import { allowedAgents } from "@/lib/chat/plan";
import { buildSystemPrompt } from "@/lib/chat/prompts";
import { MAX_TEXT_CHARS, makeTitle } from "@/lib/chat/format";
import { SEP } from "@/lib/chat/client";

/**
 * POST /api/chat  (contrato: docs/especificacion.md §4)
 * Body: { conversationId?, agent: AgentId | "grupo", groupId?, text }
 * Respuesta: texto en streaming. 401 sin sesión · 402 {error:"limite"} · 403 {error:"agente_no_incluido"}
 * · 503 {error:"no_configurado"}. Orden: sesión → configuración → plan → límite → IA.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = { conversationId?: unknown; agent?: unknown; groupId?: unknown; text?: unknown };

const AGENT_IDS = AGENTS.map((a) => a.id) as string[];
const MAX_AGENTS_IN_GROUP = 4;
const MAX_TOKENS = 4096;
const MAX_HISTORY_CHARS = 120000;

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Errores del modelo que se pueden contestar con un código HTTP antes de empezar el streaming. */
function mapModelError(e: unknown): { status: number; error: string } {
  if (e instanceof Anthropic.RateLimitError) return { status: 429, error: "ocupado" };
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    return { status: 503, error: "no_configurado" };
  }
  if (e instanceof Anthropic.APIError && (e.status === 529 || e.status === 503)) return { status: 429, error: "ocupado" };
  return { status: 502, error: "error" };
}

const sinSeparador = (s: string) => s.split(SEP).join("");

/** El efecto (esfuerzo) solo lo aceptan los modelos recientes; con otros se omite. */
function modelAcceptsEffort(model: string) {
  return /^claude-(sonnet-5|opus-5|fable-5|mythos-5|haiku-5|opus-4-[678]|sonnet-4-6)/.test(model);
}

type Turn = { role: "user" | "assistant"; content: string };

/** Historial → mensajes del modelo: empieza con la persona y junta turnos seguidos del mismo lado. */
function toTurns(
  history: { rol: string; agente: AgentId | null; contenido: string }[],
  actual: AgentId,
): Turn[] {
  const turns: Turn[] = [];
  for (const m of history) {
    if (m.rol === "sistema" || !m.contenido.trim()) continue;
    const role: Turn["role"] = m.rol === "usuario" ? "user" : "assistant";
    let content = m.contenido;
    if (role === "assistant" && m.agente && m.agente !== actual) content = `[${getAgent(m.agente).name}] ${content}`;
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else turns.push({ role, content });
  }
  // Con archivos adjuntos el historial puede crecer mucho: se conserva lo más reciente dentro de un presupuesto.
  let total = 0;
  let desde = turns.length;
  for (let i = turns.length - 1; i >= 0; i--) {
    total += turns[i].content.length;
    if (total > MAX_HISTORY_CHARS && i < turns.length - 1) break;
    desde = i;
  }
  const recientes = turns.slice(desde);
  while (recientes.length && recientes[0].role !== "user") recientes.shift();
  return recientes;
}

export async function POST(req: Request) {
  /* 1. Sesión */
  const sb = getServerSupabase();
  if (!sb) return fail(503, "no_configurado");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return fail(401, "sesion");

  /* 2. Lo que llega */
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail(400, "solicitud");
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const agentRaw = typeof body.agent === "string" ? body.agent : "";
  const groupId = typeof body.groupId === "string" ? body.groupId : null;
  const conversationId = typeof body.conversationId === "string" && body.conversationId ? body.conversationId : null;
  if (!text || text.length > MAX_TEXT_CHARS) return fail(400, "solicitud");
  if (agentRaw !== "grupo" && !AGENT_IDS.includes(agentRaw)) return fail(400, "solicitud");
  if (agentRaw === "grupo" && !groupId) return fail(400, "solicitud");

  /* 3. La IA está configurada */
  const { apiKey, model } = aiConfig();
  if (!apiKey) return fail(503, "no_configurado");

  /* 4. El agente viene en el plan */
  const perfil = await getChatUser(sb, user.id);
  const permitidos = allowedAgents(perfil.plan, perfil.equipo);

  let equipo: AgentId[];
  let grupo: { id: string; nombre: string; agentes: AgentId[] } | null = null;
  if (agentRaw === "grupo") {
    grupo = await getGrupo(sb, groupId as string);
    if (!grupo || grupo.agentes.length === 0) return fail(404, "conversacion");
    equipo = grupo.agentes.filter((a) => AGENT_IDS.includes(a)).slice(0, MAX_AGENTS_IN_GROUP);
  } else {
    equipo = [agentRaw as AgentId];
  }
  if (equipo.length === 0 || equipo.some((a) => !permitidos.includes(a))) return fail(403, "agente_no_incluido");

  /* 5. Límite de mensajes del mes */
  const limite = await getPlanLimit(sb, perfil.plan);
  if (limite !== null) {
    const usados = await countUserMessagesThisMonth(sb, user.id);
    if (usados >= limite) return fail(402, "limite");
  }

  /* 6. Conversación (si ya existe, se revisa que sea suya; aún no se escribe nada) */
  let convId = conversationId;
  let previos: { rol: string; agente: AgentId | null; contenido: string }[] = [];
  let agentesPrevios: AgentId[] = [];
  if (convId) {
    const { data: existe } = await sb.from("conversations").select("id, agentes").eq("id", convId).eq("user_id", user.id).maybeSingle();
    if (!existe) return fail(404, "conversacion");
    agentesPrevios = (existe.agentes as AgentId[] | null) ?? [];
    previos = await recentMessages(sb, convId);
  }

  /* 7. Llamada a la IA: se pide el primer fragmento antes de contestar para poder dar un código HTTP claro
        (y para no dejar guardado nada si el modelo falla de entrada) */
  const client = new Anthropic({ apiKey });
  const base: Turn[] = toTurns([...previos, { rol: "usuario", agente: null, contenido: text }], equipo[0]);

  async function* textoDe(agent: AgentId, posicion: number, turnos: Turn[]): AsyncGenerator<string> {
    const system = buildSystemPrompt({
      agent,
      nombre: perfil.nombre,
      negocio: perfil.negocio,
      texto: text,
      grupo: grupo ? { nombre: grupo.nombre, agentes: equipo, posicion } : undefined,
    });
    const stream = client.messages.stream({
      model,
      max_tokens: MAX_TOKENS,
      system,
      messages: turnos,
      ...(modelAcceptsEffort(model) ? { output_config: { effort: "medium" as const } } : {}),
    });
    let hubo = false;
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        hubo = true;
        yield sinSeparador(ev.delta.text);
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      yield hubo
        ? "\n\nHasta aquí puedo ayudarte con esto."
        : "Con esto no te puedo ayudar. Si crees que es un error, cuéntame de otra forma lo que necesitas.";
    }
  }

  const primero = textoDe(equipo[0], 0, base);
  let primerFragmento: IteratorResult<string>;
  try {
    primerFragmento = await primero.next();
  } catch (e) {
    console.error("[api/chat] error del modelo:", e instanceof Error ? e.message : e);
    const m = mapModelError(e);
    return fail(m.status, m.error);
  }

  /* 7b. Ya contestó: ahora sí se guarda el mensaje de la persona (y la conversación, si es nueva) */
  if (convId) {
    await touchConversation(sb, convId, Array.from(new Set([...agentesPrevios, ...equipo])));
  } else {
    convId = await createConversation(sb, {
      userId: user.id,
      titulo: makeTitle(text),
      tipo: grupo ? "grupo" : "agente",
      agentes: equipo,
      grupoId: grupo ? grupo.id : null,
    });
  }
  const guardadoUsuario = convId
    ? await insertMessage(sb, { conversationId: convId, userId: user.id, rol: "usuario", agente: null, contenido: text })
    : false;
  if (!convId || !guardadoUsuario) {
    await primero.return(undefined);
    return fail(500, "error");
  }
  const conversacion = convId;

  /* 8. Streaming: sigue y guarda la respuesta aunque la persona cierre la pestaña */
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let abierto = true;
      const enviar = (s: string) => {
        if (!abierto || !s) return;
        try {
          controller.enqueue(encoder.encode(s));
        } catch {
          abierto = false;
        }
      };
      const aviso = (data: object) => enviar(`${SEP}${JSON.stringify(data)}${SEP}`);

      const guardar = (agent: AgentId, contenido: string) =>
        contenido.trim()
          ? insertMessage(sb, { conversationId: conversacion, userId: user.id, rol: "agente", agente: agent, contenido })
          : Promise.resolve(true);

      try {
        let acumulado = "";
        let it: AsyncGenerator<string> = primero;
        let siguiente: IteratorResult<string> = primerFragmento;

        for (let i = 0; i < equipo.length; i++) {
          if (i > 0) {
            const de = getAgent(equipo[i - 1]).name;
            const a = getAgent(equipo[i]).name;
            const sistema = `${de} le pasó esto a ${a}`;
            await insertMessage(sb, { conversationId: conversacion, userId: user.id, rol: "sistema", agente: null, contenido: sistema });
            aviso({ cambio: equipo[i], sistema });
            const turnos: Turn[] = [
              ...base,
              { role: "assistant", content: `[${de}] ${acumulado}` },
              { role: "user", content: `Aviso del sistema: ${de} te pasó este pedido. Continúa con tu parte.` },
            ];
            it = textoDe(equipo[i], i, turnos);
            siguiente = await it.next();
            acumulado = "";
          }
          while (!siguiente.done) {
            acumulado += siguiente.value;
            enviar(siguiente.value);
            siguiente = await it.next();
          }
          await guardar(equipo[i], acumulado);
        }
      } catch (e) {
        console.error("[api/chat] error durante la respuesta:", e instanceof Error ? e.message : e);
        aviso({ error: e instanceof Anthropic.RateLimitError ? "ocupado" : "error" });
      } finally {
        try {
          await touchConversation(sb, conversacion);
        } catch {
          // La respuesta ya se entregó; el orden de la lista se arregla con el siguiente mensaje.
        }
        if (abierto) {
          try {
            controller.close();
          } catch {
            // Ya cerrado por el cliente.
          }
        }
      }
    },
    cancel() {
      // La persona se fue: `start` sigue hasta guardar lo que falte.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
      "X-Conversation-Id": conversacion,
    },
  });
}
