import { Link } from "next-view-transitions";
import { buttonClasses } from "@/components/ui/button";
import type { Rutas } from "./rutas";

/** Aviso de la demostración: datos de mentira, y salidas para volver al sitio o unirse a la lista. */
export function DemoNotice({ rutas }: { rutas: Rutas }) {
  return (
    <div
      role="note"
      className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:mb-12"
    >
      <p className="text-[0.9375rem] leading-snug text-app-fg-2">
        <span className="t-status mr-2">Datos de ejemplo</span>
        de Estudio Luna. Nada de esto es real.
      </p>
      <div className="-ml-4 flex items-center gap-1 sm:ml-0 sm:-mr-4 light:ml-0 light:mr-0 light:gap-2">
        <Link href={rutas.sitio} className={buttonClasses("ghost", "md", "h-11 md:h-10")}>
          Volver al sitio
        </Link>
        <Link href={rutas.lista} className={buttonClasses("secondary", "md", "h-11 md:h-10")}>
          Únete a la lista
        </Link>
      </div>
    </div>
  );
}
