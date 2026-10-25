import type { Metadata } from "next";
import { ActividadView } from "@/components/dashboard/actividad";
import { TABLERO_DEMO } from "@/lib/demo/tablero";

export const metadata: Metadata = {
  title: "Actividad de ejemplo",
  description: "La actividad de los agentes con datos de ejemplo de Estudio Luna.",
};

export default function PruebaloActividadPage() {
  return <ActividadView data={TABLERO_DEMO} />;
}
