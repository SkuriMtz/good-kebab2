/** Horas y fechas del panel, siempre en la hora de México. Solo funciones puras. */

const ZONA = "America/Mexico_City";

const HORA = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: ZONA });
const DIA = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", timeZone: ZONA });
const CLAVE = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONA });

/** "11:05 am" */
export function formatoHora(fecha: Date): string {
  return HORA.format(fecha).replace(/\s?([AP])M$/i, (_, l: string) => ` ${l.toLowerCase()}m`);
}

/** "Hoy", "Ayer" o "12 de octubre" */
export function formatoDia(fecha: Date, ahora: Date = new Date()): string {
  const clave = CLAVE.format(fecha);
  if (clave === CLAVE.format(ahora)) return "Hoy";
  if (clave === CLAVE.format(new Date(ahora.getTime() - 24 * 3600 * 1000))) return "Ayer";
  return DIA.format(fecha);
}

/** Inicio del mes (igual que lo cuenta el chat al aplicar el límite), listo para filtrar en la base. */
export function inicioDeMes(ahora: Date = new Date()): string {
  return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1)).toISOString();
}

/** 1 234 → "1,234" (con coma de miles, como se escribe en México) */
export function formatoNumero(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

/** Quita acentos y mayúsculas para buscar. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
