import { Link } from "next-view-transitions";
import type { AgentId } from "@/lib/agents";
import { buttonClasses } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { textoBloqueado } from "./plan";
import { hrefAgente, type Rutas } from "./rutas";
import type { TableroData } from "./types";

type Accion = { texto: string; icono: IconName; agente: AgentId | "grupo"; q?: string; necesita?: AgentId[] };

const ACCIONES: Accion[] = [
  { texto: "Agendar cita", icono: "calendar", agente: "lola", q: "/agendar", necesita: ["lola"] },
  { texto: "Resumir un correo", icono: "mail", agente: "clara", q: "/resumir", necesita: ["clara"] },
  { texto: "Nuevo grupo", icono: "users", agente: "grupo" },
  { texto: "Ver citas", icono: "clock", agente: "lola", q: "Muéstrame mis citas", necesita: ["lola"] },
];

/** Atajos bajo la caja: botones secundarios que abren el chat con el pedido ya escrito. */
export function QuickActions({ data, rutas }: { data: TableroData; rutas: Rutas }) {
  return (
    <ul className="-ml-4 mt-5 flex flex-wrap gap-x-1 gap-y-1 light:ml-0 light:gap-2" aria-label="Atajos">
      {ACCIONES.map((a) => {
        const falta = a.necesita?.find((id) => !data.disponibles.includes(id));
        const sinGrupos = a.agente === "grupo" && data.disponibles.length < 2;
        const bloqueada = Boolean(falta) || sinGrupos;
        const clases = buttonClasses("secondary", "md", "h-11 gap-2 md:h-10");
        const motivo = falta
          ? `${textoBloqueado(falta, data.plan)}`
          : sinGrupos
            ? "Un grupo necesita al menos dos agentes"
            : undefined;
        return (
          <li key={a.texto}>
            {bloqueada ? (
              <span
                role="link"
                aria-disabled="true"
                title={motivo}
                className={cn(clases, "pointer-events-auto cursor-not-allowed opacity-50")}
              >
                <Icon name={a.icono} size={18} />
                {a.texto}
              </span>
            ) : (
              <Link href={hrefAgente(rutas, a.agente, a.q)} className={clases}>
                <Icon name={a.icono} size={18} />
                {a.texto}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
