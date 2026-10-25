import { Composer } from "./composer";
import { DemoNotice } from "./demo-notice";
import { FirstSteps } from "./first-steps";
import { PageFrame } from "./page-frame";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { rutasDe } from "./rutas";
import { Team } from "./team";
import type { TableroData } from "./types";

function resumen(porRevisar: number) {
  if (porRevisar === 0) return "No tienes nada pendiente por ahora.";
  if (porRevisar === 1) return "Tienes 1 cosa por revisar.";
  return `Tienes ${porRevisar} cosas por revisar.`;
}

/** En el ejemplo la dueña es Ana; en vivo no se sabe cómo se identifica quien entra, así que la forma es neutra. */
function saludo({ demo, nombre }: TableroData) {
  if (demo) return nombre ? `Bienvenida a Atendel, ${nombre}` : "Bienvenida a Atendel";
  return nombre ? `Te damos la bienvenida a Atendel, ${nombre}` : "Te damos la bienvenida a Atendel";
}

/** Página de Inicio (la usan /pruebalo y /panel). */
export function InicioView({ data }: { data: TableroData }) {
  const rutas = rutasDe(data.base);
  const porRevisar = data.actividad.filter((a) => a.estado !== "listo").length;

  return (
    <PageFrame className="space-y-16 sm:space-y-20 lg:space-y-24">
      <div>
        {data.demo && <DemoNotice rutas={rutas} />}
        <h1 className="t-title">{saludo(data)}</h1>
        <p className="t-lead mt-4">{resumen(porRevisar)}</p>
        {data.incompleto && (
          <p role="status" className="mt-4 text-[0.9375rem] text-app-fg-2">
            No pudimos cargar todo. Vuelve a abrir el panel en un momento.
          </p>
        )}

        <div className="mt-10">
          <Composer />
          <QuickActions data={data} rutas={rutas} />
        </div>
      </div>

      <Team data={data} rutas={rutas} />
      <FirstSteps data={data} rutas={rutas} />
      <RecentActivity data={data} rutas={rutas} />
    </PageFrame>
  );
}
