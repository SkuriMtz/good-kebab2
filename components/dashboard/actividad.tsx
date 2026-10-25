import { ActivityBoard } from "./activity-board";
import { DemoNotice } from "./demo-notice";
import { PageFrame } from "./page-frame";
import { rutasDe } from "./rutas";
import type { TableroData } from "./types";

/** Página de Actividad (la usan /pruebalo/actividad y /panel/actividad). */
export function ActividadView({ data }: { data: TableroData }) {
  return (
    <PageFrame>
      {data.demo && <DemoNotice rutas={rutasDe(data.base)} />}
      <h1 className="t-title">Actividad</h1>
      <p className="t-lead mt-4">Lo que han hecho tus agentes. Lo importante espera tu visto bueno antes de salir.</p>
      <ActivityBoard filas={data.actividad} />
    </PageFrame>
  );
}
