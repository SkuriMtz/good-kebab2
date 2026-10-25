import type { ShellData, TableroData } from "./types";

/** Lo que necesitan la barra y el lateral: todo menos la lista completa de actividad. */
export function paraShell(data: TableroData): ShellData {
  const { actividad, ...resto } = data;
  return { ...resto, avisos: actividad.filter((a) => a.estado !== "listo") };
}
