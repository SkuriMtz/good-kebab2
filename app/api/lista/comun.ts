import { NextResponse } from "next/server";

/** Ayudas compartidas por /api/lista y /api/contacto. */

export function responder(cuerpo: Record<string, unknown>, status = 200) {
  return NextResponse.json(cuerpo, { status, headers: { "Cache-Control": "no-store" } });
}

/** Lee el JSON del cuerpo; si no es un objeto, devuelve null. */
export async function leerObjeto(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const cuerpo: unknown = await req.json();
    return cuerpo && typeof cuerpo === "object" && !Array.isArray(cuerpo) ? (cuerpo as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Texto recortado: quita caracteres de control (Postgres no acepta el nulo),
 * espacios de más y lo corta al largo máximo.
 * Con `variasLineas` conserva los saltos de línea.
 */
export function limpiar(valor: unknown, max: number, variasLineas = false): string {
  if (typeof valor !== "string") return "";
  const sinControl = variasLineas
    ? valor.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    : valor.replace(/[\u0000-\u001f\u007f]/g, " ");
  return sinControl.trim().slice(0, max);
}

export const MAX_CORREO = 254;

/** Correo con forma válida (el servidor vuelve a validar lo que ya validó la interfaz). */
export function esCorreo(valor: string): boolean {
  return valor.length >= 3 && valor.length <= MAX_CORREO && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

/** Código de Postgres para "ya existe" (índice único). */
export const YA_EXISTE = "23505";
