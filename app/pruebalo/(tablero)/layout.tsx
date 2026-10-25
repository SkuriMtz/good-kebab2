import { TableroShell } from "@/components/dashboard/shell";
import { paraShell } from "@/components/dashboard/shell-data";
import { TABLERO_DEMO } from "@/lib/demo/tablero";

/** Marco del panel de ejemplo: barra y lateral fijos; solo cambia el contenido. */
export default function PruebaloLayout({ children }: { children: React.ReactNode }) {
  return <TableroShell data={paraShell(TABLERO_DEMO)}>{children}</TableroShell>;
}
