/** Ayudas para las rutas de sesión (/auth/callback y /salir). */

/**
 * Solo rutas internas: debe empezar con "/" y no con "//" ni "/\" (eso sería
 * otro sitio). Cualquier otra cosa cae en la ruta por defecto.
 */
export function destinoSeguro(next: string | null | undefined, porDefecto = "/panel"): string {
  if (!next) return porDefecto;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return porDefecto;
  if (/[\u0000-\u001f\\]/.test(next)) return porDefecto;
  return next;
}
