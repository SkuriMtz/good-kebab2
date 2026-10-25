import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { hrefAgente, type Rutas } from "./rutas";
import type { TableroData } from "./types";

export type Paso = { id: string; texto: string; hecho: boolean; href: string | null };

/** Los pasos salen de lo que ya hizo la persona (conversaciones, actividad, grupos). */
export function calcularPasos(data: TableroData, rutas: Rutas): Paso[] {
  const primero = data.disponibles.includes("lola") ? "lola" : (data.disponibles[0] ?? "clara");
  const pasos: Paso[] = [
    { id: "entrar", texto: "Entraste a Atendel", hecho: true, href: null },
    {
      id: "hablar",
      texto: "Habla con un agente",
      hecho: data.conversaciones.length > 0,
      href: hrefAgente(rutas, primero),
    },
    {
      id: "revisar",
      texto: "Revisa lo que espera tu visto bueno",
      hecho: data.actividad.length > 0 && !data.actividad.some((a) => a.estado !== "listo"),
      href: rutas.actividad,
    },
  ];
  if (data.disponibles.length > 1) {
    pasos.push({
      id: "grupo",
      texto: "Arma un grupo de agentes",
      hecho: data.grupos.length > 0,
      href: hrefAgente(rutas, "grupo"),
    });
  }
  return pasos;
}

/** "Primeros pasos" con barra de avance. Si ya terminó todo, no se muestra. */
export function FirstSteps({ data, rutas }: { data: TableroData; rutas: Rutas }) {
  const pasos = calcularPasos(data, rutas);
  const hechos = pasos.filter((p) => p.hecho).length;
  if (hechos === pasos.length) return null;

  return (
    <section aria-labelledby="pasos-titulo" className="card">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="pasos-titulo" className="t-h3">
          Primeros pasos
        </h2>
        <p className="t-num text-[0.9375rem] text-app-fg-2">
          {hechos} de {pasos.length}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Avance de los primeros pasos"
        aria-valuemin={0}
        aria-valuemax={pasos.length}
        aria-valuenow={hechos}
        className="mt-5 h-1 w-full overflow-hidden rounded-full bg-app-fg/15"
      >
        <div className="h-full rounded-full bg-brand" style={{ width: `${(hechos / pasos.length) * 100}%` }} />
      </div>

      <ul className="mt-4">
        {pasos.map((p) => {
          const contenido = (
            <>
              {p.hecho ? (
                <Icon name="check" size={20} strokeWidth={2} className="shrink-0 text-app-fg" />
              ) : (
                <svg width={20} height={20} viewBox="0 0 24 24" className="shrink-0 text-app-fg-2" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              )}
              <span className={cn(p.hecho ? "text-app-fg-2" : "text-app-fg")}>{p.texto}</span>
              {!p.hecho && p.href && <Icon name="arrowRight" size={18} className="ml-auto shrink-0 text-app-fg-2" />}
            </>
          );
          const clases = "flex min-h-12 items-center gap-3 text-[1.0625rem] font-light light:font-normal";
          return (
            <li key={p.id}>
              {!p.hecho && p.href ? (
                <Link
                  href={p.href}
                  className={cn(
                    clases,
                    "-mx-3 rounded-control px-3 transition-[background-color,transform] duration-200 ease-out hover:bg-app-fg/[0.06] active:translate-y-px active:bg-app-fg/10",
                  )}
                >
                  {contenido}
                </Link>
              ) : (
                <div className={clases}>{contenido}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
