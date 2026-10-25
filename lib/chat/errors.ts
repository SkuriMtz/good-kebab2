import type { ChatErrorCode } from "./types";

/** Mensajes amables para cada error de /api/chat (español de México, de tú). */
export const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  sesion: "Tu sesión terminó. Entra otra vez con tu correo para seguir.",
  limite: "Ya usaste los mensajes de tu plan de este mes. Se renuevan el mes que entra.",
  agente_no_incluido: "Ese agente no viene en tu plan. Elige a otro de tu equipo.",
  no_configurado: "El chat aún no está disponible. Vuelve pronto.",
  ocupado: "Tu equipo está muy ocupado ahora. Intenta de nuevo en un momento.",
  red: "No hay conexión. Revisa tu internet e intenta de nuevo.",
  conversacion: "No encontramos esa conversación. Empieza una nueva.",
  solicitud: "No pudimos leer tu mensaje. Revísalo e intenta de nuevo.",
  error: "No se pudo contestar. Intenta de nuevo en un momento.",
};

export function errorFromStatus(status: number, body?: { error?: string } | null): ChatErrorCode {
  const e = body?.error;
  if (status === 401) return "sesion";
  if (status === 402 || e === "limite") return "limite";
  if (status === 403 || e === "agente_no_incluido") return "agente_no_incluido";
  if (status === 503 || e === "no_configurado") return "no_configurado";
  if (status === 429 || status === 529 || e === "ocupado") return "ocupado";
  if (status === 404 || e === "conversacion") return "conversacion";
  if (status === 400 || e === "solicitud") return "solicitud";
  return "error";
}
