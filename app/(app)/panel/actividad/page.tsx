import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActividadView } from "@/components/dashboard/actividad";
import { cargarPanel, destinoSinPanel } from "@/lib/db/panel";

export const metadata: Metadata = { title: "Actividad", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelActividadPage() {
  const r = await cargarPanel();
  if (r.estado !== "ok") redirect(destinoSinPanel(r.estado, "/panel/actividad"));
  return <ActividadView data={r.data} />;
}
