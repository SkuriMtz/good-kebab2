"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { AGENTS, getAgent, type AgentId } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Button, buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { createGrupo } from "@/lib/db/chat";
import { COMMANDS, norm, parseCommand, parseMention, workingStatus } from "@/lib/chat/commands";
import { streamChat } from "@/lib/chat/client";
import { ERROR_MESSAGES } from "@/lib/chat/errors";
import { MAX_TEXT_CHARS, makeTitle, oneLine, uid, withAttachment } from "@/lib/chat/format";
import type { ResultCard } from "@/lib/db/types";
import type { ChatErrorCode, ChatMessage, ChatTarget, ConversationMeta, GroupSummary } from "@/lib/chat/types";
import { DEMO_GUION_ID, DEMO_NOTICE, DEMO_SUGGESTIONS, planDemoReply } from "@/lib/demo/chat";
import { AgentStack } from "./agent-stack";
import { AgentStatus, TypingIndicator } from "./agent-status";
import { useChat } from "./chat-context";
import { Composer, type Attachment, type ComposerNotice } from "./composer";
import { MessageView } from "./message-view";
import { NewGroupSheet } from "./new-group-sheet";
import { UrlPrefill, type Prefill } from "./url-prefill";

type Phase =
  | { kind: "idle" }
  | { kind: "estado"; agente: AgentId; texto: string }
  | { kind: "escribiendo"; agente: AgentId }
  | { kind: "respondiendo"; agente: AgentId };

type Props = {
  conversationId: string | null;
  conversation: ConversationMeta | null;
  initialMessages: ChatMessage[];
};

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function abortError() {
  return new DOMException("Cancelado", "AbortError");
}
const isAbort = (e: unknown) => (e as { name?: string })?.name === "AbortError";

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const onAbort = () => {
      window.clearTimeout(t);
      reject(abortError());
    };
    const t = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, reducedMotion() ? Math.min(ms, 250) : ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

const QUICK = ["agendar", "resumir", "redactar", "reporte"];

export function ChatThread({ conversationId, conversation, initialMessages }: Props) {
  const ctx = useChat();
  const router = useRouter();
  const { mode, allowed, groups, basePath } = ctx;
  const demo = mode === "demo";

  const meta = conversation ?? (conversationId ? (ctx.conversations.find((c) => c.id === conversationId) ?? null) : null);

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => (demo && conversationId ? ctx.getThread(conversationId) : undefined) ?? initialMessages,
  );
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [notice, setNotice] = useState<ComposerNotice | null>(null);
  const [groupSheet, setGroupSheet] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);

  const convId = useRef<string | null>(conversationId);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const lastSent = useRef<string>("");

  const defaultTarget = useCallback((): ChatTarget => {
    if (meta?.tipo === "grupo" && meta.grupo_id) return { kind: "grupo", groupId: meta.grupo_id };
    const own = meta?.agentes.slice().reverse().find((a) => allowed.includes(a));
    return { kind: "agente", agent: own ?? allowed[0] ?? "clara" };
  }, [meta, allowed]);
  const [target, setTarget] = useState<ChatTarget>(defaultTarget);

  const busy = phase.kind !== "idle";
  const empty = messages.length === 0 && !busy;
  const missing = !!conversationId && !meta && messages.length === 0;

  /* ----------------------- Guardar el hilo (ejemplo) ----------------------- */
  useEffect(() => {
    if (demo && convId.current) ctx.setThread(convId.current, messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, demo]);

  useEffect(() => () => abortRef.current?.abort(), []);

  /* ------------------------------- Scroll ------------------------------- */
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, phase]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
  };

  /* --------------------------- Utilidades de estado --------------------------- */
  const append = useCallback((m: ChatMessage) => setMessages((p) => [...p, m]), []);
  const patch = useCallback(
    (id: string, fn: (m: ChatMessage) => ChatMessage) => setMessages((p) => p.map((m) => (m.id === id ? fn(m) : m))),
    [],
  );
  const newAgentMessage = (agente: AgentId, extra: Partial<ChatMessage> = {}): ChatMessage => ({
    id: uid(),
    rol: "agente",
    agente,
    contenido: "",
    tarjeta: null,
    created_at: new Date().toISOString(),
    ...extra,
  });
  const systemMessage = (contenido: string): ChatMessage => ({
    id: uid(),
    rol: "sistema",
    agente: null,
    contenido,
    tarjeta: null,
    created_at: new Date().toISOString(),
  });

  const title = meta?.titulo ?? (messages.find((m) => m.rol === "usuario") ? makeTitle(messages.find((m) => m.rol === "usuario")!.contenido) : "");

  const groupOf = (t: ChatTarget): GroupSummary | undefined => (t.kind === "grupo" ? groups.find((g) => g.id === t.groupId) : undefined);

  /** Refleja la conversación en la lista lateral. */
  const syncList = (id: string, ultimo: string, tgt: ChatTarget, tituloNuevo: string) => {
    const g = groupOf(tgt);
    ctx.upsertConversation({
      id,
      titulo: meta?.titulo ?? tituloNuevo,
      tipo: g ? "grupo" : "agente",
      agentes: g ? g.agentes : tgt.kind === "agente" ? Array.from(new Set([...(meta?.agentes ?? []), tgt.agent])) : [],
      grupo_id: g ? g.id : null,
      ultimo: oneLine(ultimo),
      updated_at: new Date().toISOString(),
    });
  };

  /* ------------------------ Respuesta con guion (ejemplo) ------------------------ */
  const runDemo = async (texto: string, tgt: ChatTarget, respuestaFija?: string) => {
    const ac = new AbortController();
    abortRef.current = ac;
    const steps = planDemoReply({ texto, target: tgt, groups, respuestaFija });
    let ultimo = "";
    try {
      for (const s of steps) {
        if (s.t === "estado") {
          setPhase({ kind: "estado", agente: s.agente, texto: s.texto });
          await sleep(s.ms, ac.signal);
        } else if (s.t === "escribiendo") {
          setPhase({ kind: "escribiendo", agente: s.agente });
          await sleep(s.ms, ac.signal);
        } else if (s.t === "sistema") {
          append(systemMessage(s.contenido));
          await sleep(s.ms, ac.signal);
        } else {
          const m = newAgentMessage(s.agente);
          append(m);
          setStreamingId(m.id);
          setPhase({ kind: "respondiendo", agente: s.agente });
          const parts = s.contenido.split(/(\s+)/);
          if (reducedMotion()) {
            patch(m.id, (x) => ({ ...x, contenido: s.contenido }));
          } else {
            let acc = "";
            for (let i = 0; i < parts.length; i += 4) {
              acc += parts.slice(i, i + 4).join("");
              const snapshot = acc;
              patch(m.id, (x) => ({ ...x, contenido: snapshot }));
              await sleep(55, ac.signal);
            }
          }
          patch(m.id, (x) => ({ ...x, tarjeta: s.tarjeta ?? null, nota: s.nota }));
          setStreamingId(null);
          ultimo = s.contenido;
        }
      }
    } catch (e) {
      if (!isAbort(e)) throw e;
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      setPhase({ kind: "idle" });
      setStreamingId(null);
      // Un mensaje a medias que se detuvo sin texto no se queda vacío.
      setMessages((p) => p.filter((m) => !(m.rol === "agente" && !m.contenido && !m.tarjeta)));
    }
    return ultimo;
  };

  /* ------------------------------ Respuesta real ------------------------------ */
  const runLive = async (full: string, tgt: ChatTarget, cmdText: string, restore: () => void) => {
    const ac = new AbortController();
    abortRef.current = ac;
    const g = groupOf(tgt);
    const cmd = parseCommand(cmdText)?.command ?? null;
    const first: AgentId = tgt.kind === "agente" ? tgt.agent : (g?.agentes[0] ?? "clara");
    let current: AgentId = first;
    let curId: string | null = null;
    let ultimo = "";
    let startedId: string | null = null;
    const createdNew = !convId.current;

    setPhase({ kind: "estado", agente: first, texto: workingStatus(first, cmd) });

    const res = await streamChat(
      {
        conversationId: convId.current ?? undefined,
        agent: tgt.kind === "agente" ? tgt.agent : "grupo",
        groupId: tgt.kind === "grupo" ? tgt.groupId : undefined,
        text: full,
      },
      {
        signal: ac.signal,
        onStart: (id) => {
          startedId = id;
          if (id && !convId.current) convId.current = id;
        },
        onEvent: (e) => {
          if (e.t === "texto") {
            if (!curId) {
              const m = newAgentMessage(current);
              curId = m.id;
              append(m);
              setStreamingId(m.id);
              setPhase({ kind: "respondiendo", agente: current });
            }
            ultimo += e.texto;
            const id = curId;
            patch(id, (x) => ({ ...x, contenido: x.contenido + e.texto }));
          } else if (e.t === "cambio") {
            curId = null;
            ultimo = "";
            setStreamingId(null);
            append(systemMessage(e.sistema));
            current = e.agente;
            setPhase({ kind: "estado", agente: e.agente, texto: workingStatus(e.agente) });
          }
        },
      },
    ).catch((e) => {
      if (isAbort(e)) return null;
      throw e;
    });

    if (abortRef.current === ac) abortRef.current = null;
    setPhase({ kind: "idle" });
    setStreamingId(null);
    setMessages((p) => p.filter((m) => !(m.rol === "agente" && !m.contenido && !m.tarjeta)));

    if (res && !res.ok) {
      if (!res.guardado) {
        // No llegó a guardarse: se devuelve el mensaje a la caja para que lo reenvíe.
        restore();
        setNotice({ tono: "error", texto: ERROR_MESSAGES[res.codigo] });
        return;
      }
      setNotice({
        tono: "error",
        texto: ERROR_MESSAGES[res.codigo],
        accion: { label: "Reintentar", onClick: () => void send(lastSent.current) },
      });
    }

    const id = convId.current ?? startedId;
    if (id) {
      syncList(id, ultimo || oneLine(full), tgt, makeTitle(full));
      ctx.refreshList();
      if (createdNew || !conversationId) router.replace(`${basePath}/${id}`);
    }
  };

  /* --------------------------------- Enviar --------------------------------- */
  const send = async (
    raw: string,
    opts: { target?: ChatTarget; autor?: string; respuestaFija?: string } = {},
  ) => {
    if (busy) return;
    let texto = raw.trim();
    let tgt = opts.target ?? target;

    const mention = parseMention(texto);
    if (mention) {
      tgt = { kind: "agente", agent: mention.agent };
      texto = mention.resto;
      if (!texto) {
        setTarget(tgt);
        setValue("");
        return;
      }
    }
    const parsed = parseCommand(texto);
    if (parsed) tgt = { kind: "agente", agent: parsed.command.agent };

    const needed = tgt.kind === "agente" ? [tgt.agent] : (groupOf(tgt)?.agentes ?? []);
    const locked = needed.find((a) => !allowed.includes(a));
    if (locked || needed.length === 0) {
      setNotice({
        tono: "error",
        texto: locked ? `${getAgent(locked).name} no viene en tu plan. Elige a otro de tu equipo.` : ERROR_MESSAGES.conversacion,
      });
      return;
    }

    const full = attachment ? withAttachment(texto, attachment.nombre, attachment.contenido) : texto;
    if (!full.trim()) return;
    if (full.length > MAX_TEXT_CHARS) {
      setNotice({ tono: "error", texto: "Ese mensaje es muy largo. Acórtalo o adjunta un archivo más pequeño." });
      return;
    }

    const typed = value;
    const hadAttachment = attachment;
    lastSent.current = texto;
    setTarget(tgt);
    setValue("");
    setAttachment(null);
    setNotice(null);
    stick.current = true;

    const userMsg: ChatMessage = {
      id: uid(),
      rol: "usuario",
      agente: null,
      contenido: full,
      tarjeta: null,
      created_at: new Date().toISOString(),
      autor: opts.autor,
    };
    append(userMsg);

    if (demo) {
      if (!convId.current) convId.current = uid("demo");
      const id = convId.current;
      syncList(id, full, tgt, makeTitle(full));
      const ultimo = await runDemo(texto, tgt, opts.respuestaFija);
      if (ultimo) syncList(id, ultimo, tgt, makeTitle(full));
      if (!conversationId) router.replace(`${basePath}/${id}`);
      return;
    }

    await runLive(full, tgt, texto, () => {
      setMessages((p) => p.filter((m) => m.id !== userMsg.id));
      setValue(typed);
      if (hadAttachment) setAttachment(hadAttachment);
    });
  };

  const stop = () => abortRef.current?.abort();

  /* ------------------------ Botón de la tarjeta ("Aprobar y enviar") ------------------------ */
  const onCardAction = async (card: ResultCard, message: ChatMessage) => {
    const agente = message.agente ?? (target.kind === "agente" ? target.agent : "clara");
    if (demo) {
      await sleep(900, new AbortController().signal);
      append(
        newAgentMessage(agente, {
          contenido: card.pendiente
            ? "Listo, quedó con tu visto bueno. Como esto es una demostración, no se envió nada de verdad."
            : "Listo. Como esto es una demostración, no se abrió ningún archivo de verdad.",
        }),
      );
      return;
    }
    await send(`Aprobado: ${card.titulo}. Puedes continuar.`, { target: { kind: "agente", agent: agente } });
  };

  /* ------------- Datos de la dirección (?q=, ?agente=, ?grupo=, ?nueva=1) ------------- */
  const onPrefill = useCallback(
    (p: Prefill) => {
      if (p.grupo) {
        // ?agente=grupo&grupo=<id>: escribirle a ese grupo.
        const g = groups.find((x) => x.id === p.grupo);
        if (g && !g.agentes.some((a) => !allowed.includes(a))) setTarget({ kind: "grupo", groupId: g.id });
        else if (g) setNotice({ tono: "info", texto: "Ese grupo tiene agentes que no vienen en tu plan." });
      } else if (p.agente === "grupo") {
        // ?agente=grupo sin id: "Nuevo grupo".
        if (allowed.length > 1) setGroupSheet(true);
      } else if (p.agente) {
        const a = AGENTS.find((x) => x.id === norm(p.agente ?? ""));
        if (a && allowed.includes(a.id)) setTarget({ kind: "agente", agent: a.id });
        else if (a) setNotice({ tono: "info", texto: `${a.name} no viene en tu plan. Elige a otro de tu equipo.` });
      }
      if (p.q) setValue(p.q.slice(0, 2000));
      // Con texto o en una conversación nueva, la caja queda lista para escribir.
      if (p.q || p.nueva) requestAnimationFrame(() => textareaRef.current?.focus());
    },
    [allowed, groups],
  );

  /* ---------------------------------- Grupos ---------------------------------- */
  const createGroup = async (nombre: string, agentes: AgentId[]): Promise<string | null> => {
    if (demo) {
      const g: GroupSummary = { id: uid("grupo"), nombre, agentes };
      ctx.addGroup(g);
      setTarget({ kind: "grupo", groupId: g.id });
      setGroupSheet(false);
      return null;
    }
    const sb = getBrowserSupabase();
    if (!sb) return ERROR_MESSAGES.no_configurado;
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return ERROR_MESSAGES.sesion;
    const g = await createGrupo(sb, { userId: user.id, nombre, agentes });
    if (!g) return "No se pudo crear el grupo. Intenta de nuevo en un momento.";
    ctx.addGroup(g);
    setTarget({ kind: "grupo", groupId: g.id });
    setGroupSheet(false);
    ctx.refreshList();
    return null;
  };

  /* ---------------------------------- Vistas ---------------------------------- */
  const quick = useMemo(
    () => COMMANDS.filter((c) => QUICK.includes(c.id) && allowed.includes(c.agent)),
    [allowed],
  );

  const pendingSuggestions =
    demo && convId.current === DEMO_GUION_ID && !busy
      ? DEMO_SUGGESTIONS.filter((s) => !usedSuggestions.includes(s.texto))
      : [];

  const nombre = ctx.userName?.trim();
  const targetGroup = groupOf(target);
  const headerAgents = meta?.agentes ?? (target.kind === "agente" ? [target.agent] : (targetGroup?.agentes ?? []));

  if (missing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="t-h3">No encontramos esta conversación</p>
        <p className="t-lead">Puede que se haya borrado. Empieza una nueva desde aquí.</p>
        <Link href={basePath} className={buttonClasses("secondary", "lg")}>
          Nueva conversación
        </Link>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <UrlPrefill onPrefill={onPrefill} />
      </Suspense>

      <header className="flex h-16 shrink-0 items-center gap-2 px-2 sm:px-5">
        <button
          type="button"
          onClick={ctx.openList}
          aria-label="Abrir tus conversaciones"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-chat-fg transition-[background-color,transform] duration-200 hover:bg-chat-fg/10 active:translate-y-px active:bg-chat-fg/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
        >
          <Icon name="menu" size={24} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!empty && headerAgents.length > 0 && <AgentStack agentes={headerAgents} size={32} className="hidden sm:inline-block" />}
          {!empty && title && <h1 className="truncate text-[1.0625rem] font-semibold text-chat-fg">{title}</h1>}
        </div>
        {demo && <p className="t-status shrink-0 light:text-chat-fg-2">Datos de ejemplo</p>}
        <ThemeToggle />
      </header>

      <div className={cn("flex min-h-0 flex-1 flex-col items-center", empty && "lg:justify-center")}>
        {empty ? (
          <div className="flex w-full flex-1 flex-col items-center justify-center px-5 pb-6 text-center lg:flex-none lg:pb-12">
            <h1 className="t-title-lg">{nombre ? `Hola, ${nombre}` : "Hola"}</h1>
            <p className="t-lead mt-5 max-w-[34ch] text-balance">¿Qué quieres que haga tu equipo hoy?</p>
            {demo && <p className="mt-4 max-w-[40ch] text-[0.9375rem] font-normal text-chat-fg-2">{DEMO_NOTICE}</p>}
            {quick.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-2" role="group" aria-label="Comandos para empezar">
                {quick.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setValue(`${c.nombre} `);
                      setTarget({ kind: "agente", agent: c.agent });
                      requestAnimationFrame(() => {
                        const el = textareaRef.current;
                        el?.focus();
                        el?.setSelectionRange(c.nombre.length + 1, c.nombre.length + 1);
                      });
                    }}
                    title={c.descripcion}
                    className="!normal-case"
                  >
                    {c.nombre}
                  </Button>
                ))}
              </div>
            )}
            <p className="mt-5 max-w-[40ch] text-[0.9375rem] font-normal text-chat-fg-2">
              Escribe / para ver los comandos o @ para elegir a un agente.
            </p>
          </div>
        ) : (
          <div
            ref={scroller}
            onScroll={onScroll}
            data-lenis-prevent
            className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain"
          >
            <div
              role="log"
              aria-label="Conversación"
              aria-busy={phase.kind === "respondiendo" || undefined}
              className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-5 pb-8 pt-4 sm:px-6"
            >
              {demo && <p className="text-center text-[0.875rem] font-normal text-chat-fg-2">{DEMO_NOTICE}</p>}
              {messages.map((m, i) => (
                <MessageView
                  key={m.id}
                  message={m}
                  previous={messages[i - 1]}
                  streaming={m.id === streamingId}
                  onCardAction={onCardAction}
                />
              ))}
              {phase.kind === "estado" && <AgentStatus agent={phase.agente} texto={phase.texto} />}
              {phase.kind === "escribiendo" && <TypingIndicator agent={phase.agente} />}
              {pendingSuggestions.length > 0 && (
                <div>
                  <p className="mb-3 text-center text-[0.9375rem] font-normal text-chat-fg-2">Sigue la conversación como Marta</p>
                  <div className="flex flex-wrap justify-center gap-x-1 gap-y-2">
                    {pendingSuggestions.map((s) => (
                      <Button
                        key={s.texto}
                        type="button"
                        variant="secondary"
                        size="lg"
                        className="!whitespace-normal !text-center !normal-case"
                        onClick={() => {
                          setUsedSuggestions((u) => [...u, s.texto]);
                          void send(s.texto, { autor: "Marta", respuestaFija: s.respuesta, target: { kind: "agente", agent: "lola" } });
                        }}
                      >
                        {s.texto}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex w-full justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 sm:px-6">
          <Composer
            value={value}
            onChange={setValue}
            onSend={() => void send(value)}
            onStop={stop}
            busy={busy}
            target={target}
            onTarget={setTarget}
            allowed={allowed}
            groups={groups}
            attachment={attachment}
            onAttach={setAttachment}
            onNewGroup={() => setGroupSheet(true)}
            notice={notice}
            textareaRef={textareaRef}
            wide={empty}
          />
        </div>
      </div>

      <NewGroupSheet open={groupSheet} onClose={() => setGroupSheet(false)} allowed={allowed} onCreate={createGroup} />
    </>
  );
}

export type { ChatErrorCode };
