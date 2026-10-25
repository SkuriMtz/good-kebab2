import type { Rutas } from "./rutas";
import { hrefAgente, hrefConversacion } from "./rutas";
import type { FilaActividad, FilaConversacion } from "./types";

/**
 * A dónde lleva "Revisar": a la conversación más reciente de ese agente
 * (ahí está la tarjeta por aprobar); si no hay, a un chat nuevo con él.
 */
export function hrefRevisar(rutas: Rutas, conversaciones: FilaConversacion[], fila: FilaActividad) {
  const conv = conversaciones.find((c) => c.tipo === "agente" && c.agentes.includes(fila.agente));
  return conv ? hrefConversacion(rutas, conv) : hrefAgente(rutas, fila.agente);
}
