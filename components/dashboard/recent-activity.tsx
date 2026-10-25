import { Link } from "next-view-transitions";
import { Icon } from "@/components/ui/icon";
import { buttonClasses } from "@/components/ui/button";
import { ActivityRow } from "./activity-row";
import { hrefRevisar } from "./revisar";
import { hrefChat, type Rutas } from "./rutas";
import type { TableroData } from "./types";

/** Texto del estado vacío de la actividad (textos.md §9 y spec: "Todavía no hay actividad…"). */
export function EmptyActivity({ rutas, titulo = "Todavía no hay actividad" }: { rutas: Rutas; titulo?: string }) {
  return (
    <div className="py-4">
      <p className="text-[1.0625rem] font-normal text-app-fg">{titulo}</p>
      <p className="mt-1 text-[0.9375rem] text-app-fg-2">Aquí verás lo que hacen tus agentes.</p>
      <Link href={hrefChat(rutas)} className={buttonClasses("secondary", "md", "mt-5 h-11 md:h-10")}>
        Empieza una conversación
      </Link>
    </div>
  );
}

const MOSTRAR = 5;

/** Las últimas filas de actividad, para la página de Inicio. */
export function RecentActivity({ data, rutas }: { data: TableroData; rutas: Rutas }) {
  const filas = data.actividad.slice(0, MOSTRAR);
  return (
    <section aria-labelledby="actividad-titulo" className="card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 id="actividad-titulo" className="t-h3">
          Lo que hacen tus agentes
        </h2>
        {data.actividad.length > MOSTRAR && (
          <Link
            href={rutas.actividad}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[0.9375rem] font-normal text-app-fg-2 transition-colors duration-200 hover:text-app-fg light:text-link light:hover:underline"
          >
            Ver toda la actividad
            <Icon name="arrowRight" size={16} />
          </Link>
        )}
      </div>

      {filas.length === 0 ? (
        <div className="mt-4">
          <EmptyActivity rutas={rutas} />
        </div>
      ) : (
        <ul className="mt-3 light:divide-y light:divide-app-line">
          {filas.map((fila) => (
            <ActivityRow key={fila.id} fila={fila} href={hrefRevisar(rutas, data.conversaciones, fila)} />
          ))}
        </ul>
      )}
    </section>
  );
}
