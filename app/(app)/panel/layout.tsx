import { redirect } from "next/navigation";
import { TableroShell } from "@/components/dashboard/shell";
import { paraShell } from "@/components/dashboard/shell-data";
import { cargarPanel, destinoSinPanel } from "@/lib/db/panel";

export const dynamic = "force-dynamic";

/** Marco del panel real: carga los datos de la persona; sin sesión o sin Supabase, manda a /entrar. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const r = await cargarPanel();
  if (r.estado !== "ok") redirect(destinoSinPanel(r.estado));
  return <TableroShell data={paraShell(r.data)}>{children}</TableroShell>;
}
