import { parseCommand } from "./commands";

/* ------------------------- Archivos adjuntos (texto) ------------------------- */
// El contenido del archivo viaja dentro del mismo mensaje, detrás de una marca que
// la interfaz reconoce para mostrar solo el nombre del archivo.

export const MAX_ATTACH_BYTES = 60 * 1024;
export const MAX_TEXT_CHARS = 70000;

const ATTACH_RE = /\n*---adjunto:([^\n]+?)---\n[\s\S]*$/;

export function withAttachment(texto: string, nombre: string, contenido: string): string {
  const limpio = nombre.replace(/\s*\n\s*/g, " ").replace(/-{3,}/g, "-").trim() || "archivo";
  return `${texto.trim()}\n\n---adjunto:${limpio}---\n${contenido}`;
}

export function splitAttachment(contenido: string): { texto: string; adjunto: string | null } {
  const m = ATTACH_RE.exec(contenido);
  if (!m) return { texto: contenido, adjunto: null };
  return { texto: contenido.slice(0, m.index).trim(), adjunto: m[1].trim() };
}

/* --------------------------------- Títulos --------------------------------- */

/** Título de una conversación nueva a partir del primer mensaje. */
export function makeTitle(texto: string): string {
  const { texto: limpio } = splitAttachment(texto);
  const cmd = parseCommand(limpio);
  let base = limpio.replace(/\s+/g, " ").trim();
  if (cmd) {
    const nombre = cmd.command.id.charAt(0).toUpperCase() + cmd.command.id.slice(1);
    base = cmd.resto ? `${nombre}: ${cmd.resto.replace(/\s+/g, " ")}` : nombre;
  }
  if (!base) base = "Conversación nueva";
  if (base.length <= 48) return base;
  const cut = base.slice(0, 48);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 24 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Una línea para la lista lateral. */
export function oneLine(texto: string): string {
  const { texto: limpio, adjunto } = splitAttachment(texto);
  const linea = limpio.replace(/\s+/g, " ").trim();
  return linea || (adjunto ? `Archivo: ${adjunto}` : "");
}

/* ---------------------------------- Horas ---------------------------------- */

/** "9:41 pm" (como en los textos del proyecto). */
export function formatHora(fecha: Date): string {
  const h = fecha.getHours();
  const m = String(fecha.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "pm" : "am"}`;
}

let counter = 0;
/** Id local para mensajes que aún no están en la base. */
export function uid(prefix = "m"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}
