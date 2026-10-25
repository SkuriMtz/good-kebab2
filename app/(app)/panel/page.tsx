import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InicioView } from "@/components/dashboard/inicio";
import { cargarPanel, destinoSinPanel } from "@/lib/db/panel";

export const metadata: Metadata = { title: "Inicio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const r = await cargarPanel();
  if (r.estado !== "ok") redirect(destinoSinPanel(r.estado));
  return <InicioView data={r.data} />;
}
