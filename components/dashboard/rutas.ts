import type { AgentId } from "@/lib/agents";
import type { FilaConversacion, FilaGrupo, TableroData } from "./types";

/** Rutas del panel. En /pruebalo todo cuelga de "/pruebalo"; en el panel real, de "/panel" y "/chat". */
export type Rutas = {
  inicio: string;
  actividad: string;
  chat: string;
  /** Salida de la demostración: la portada. */
  sitio: string;
  /** Lista de espera (sección de la portada). */
  lista: string;
};

export function rutasDe(base: TableroData["base"]): Rutas {
  const raiz = base || "/panel";
  return { inicio: raiz, actividad: `${raiz}/actividad`, chat: `${base}/chat`, sitio: "/", lista: "/#lista" };
}

export function hrefChat(rutas: Rutas, params?: Record<string, string>) {
  const q = params ? new URLSearchParams(params).toString() : "";
  return q ? `${rutas.chat}?${q}` : rutas.chat;
}

/** Abre el chat con un agente; con `texto`, ya escrito (q) y listo para enviar. */
export function hrefAgente(rutas: Rutas, agente: AgentId | "grupo", texto?: string) {
  return hrefChat(rutas, texto ? { q: texto, agente } : { agente });
}

export function hrefGrupo(rutas: Rutas, g: FilaGrupo) {
  return g.hilo ? `${rutas.chat}/${g.hilo}` : hrefChat(rutas, { agente: "grupo", grupo: g.id });
}

export function hrefConversacion(rutas: Rutas, c: FilaConversacion) {
  return `${rutas.chat}/${c.id}`;
}
