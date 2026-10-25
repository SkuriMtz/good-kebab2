import type { Metadata } from "next";
import { InicioView } from "@/components/dashboard/inicio";
import { TABLERO_DEMO } from "@/lib/demo/tablero";

export const metadata: Metadata = {
  title: "Pruébalo",
  description: "Mira el panel de Atendel con datos de ejemplo de Estudio Luna.",
};

export default function PruebaloPage() {
  return <InicioView data={TABLERO_DEMO} />;
}
