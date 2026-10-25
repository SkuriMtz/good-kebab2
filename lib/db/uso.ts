import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Uso del mes: la tabla `uso_mensual` (la suma un trigger de la base al guardar cada mensaje de la persona).
 * Contar filas de `messages` no sirve: borrar una conversación bajaría el uso.
 */

/** Primer día del mes (UTC) como lo guarda la base: "2026-10-01". */
export function mesActual(ahora: Date = new Date()): string {
  return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

/** Consulta (sin ejecutar todavía) del uso de este mes; sin fila es que aún no escribió ninguno. */
export function consultaUsoDelMes(sb: SupabaseClient, userId: string) {
  return sb.from("uso_mensual").select("mensajes").eq("user_id", userId).eq("mes", mesActual()).maybeSingle();
}
