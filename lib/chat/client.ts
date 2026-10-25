import type { AgentId } from "@/lib/agents";
import { errorFromStatus } from "./errors";
import type { ChatErrorCode } from "./types";

/**
 * Cliente de /api/chat (navegador).
 *
 * La respuesta es texto en streaming. Solo en grupos (y en errores a medias) el servidor
 * mete avisos entre dos marcas U+001E: `\u001e{"cambio":"clara","sistema":"..."}\u001e`.
 * Un agente solo nunca los trae: es texto puro.
 */
export const SEP = "\u001e";

export type ChatRequest = {
  conversationId?: string;
  agent: AgentId | "grupo";
  groupId?: string;
  text: string;
};

export type StreamEvent =
  | { t: "texto"; texto: string }
  | { t: "cambio"; agente: AgentId; sistema: string }
  | { t: "error"; codigo: ChatErrorCode };

export type StreamResult =
  | { ok: true; conversationId: string | null }
  | { ok: false; codigo: ChatErrorCode; /** true si el mensaje ya quedó guardado en el servidor */ guardado: boolean };

export async function streamChat(
  body: ChatRequest,
  opts: {
    signal?: AbortSignal;
    onEvent: (e: StreamEvent) => void;
    /** Se llama en cuanto llegan los encabezados, con el id de la conversación (nueva o existente). */
    onStart?: (conversationId: string | null) => void;
  },
): Promise<StreamResult> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") throw err;
    return { ok: false, codigo: "red", guardado: false };
  }

  if (!res.ok || !res.body) {
    let data: { error?: string } | null = null;
    try {
      data = await res.json();
    } catch {
      // Sin cuerpo legible: se usa solo el código HTTP.
    }
    return { ok: false, codigo: errorFromStatus(res.status, data), guardado: false };
  }

  const conversationId = res.headers.get("X-Conversation-Id");
  opts.onStart?.(conversationId);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let inJson = false;
  let json = "";
  let failed: ChatErrorCode | null = null;

  const flushJson = () => {
    try {
      const data = JSON.parse(json) as { cambio?: AgentId; sistema?: string; error?: string };
      if (data.error) {
        failed = errorFromStatus(500, { error: data.error });
        opts.onEvent({ t: "error", codigo: failed });
      } else if (data.cambio) {
        opts.onEvent({ t: "cambio", agente: data.cambio, sistema: data.sistema ?? "" });
      }
    } catch {
      // Aviso dañado: se ignora.
    }
    json = "";
  };

  const feed = (chunk: string) => {
    let rest = chunk;
    while (rest.length) {
      const i = rest.indexOf(SEP);
      if (i === -1) {
        if (inJson) json += rest;
        else opts.onEvent({ t: "texto", texto: rest });
        return;
      }
      const part = rest.slice(0, i);
      if (inJson) {
        json += part;
        flushJson();
        inJson = false;
      } else {
        if (part) opts.onEvent({ t: "texto", texto: part });
        inJson = true;
        json = "";
      }
      rest = rest.slice(i + 1);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      feed(decoder.decode(value, { stream: true }));
    }
    const tail = decoder.decode();
    if (tail) feed(tail);
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") throw err;
    return { ok: false, codigo: "red", guardado: true };
  }

  if (failed) return { ok: false, codigo: failed, guardado: true };
  return { ok: true, conversationId };
}
