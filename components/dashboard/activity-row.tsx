import { Link } from "next-view-transitions";
import { getAgent } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AgentBlob } from "@/components/brand/agent-blob";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { EstadoActividad, FilaActividad } from "./types";

export const TEXTO_ESTADO: Record<EstadoActividad, string> = {
  listo: "Listo",
  espera: "Espera tu visto bueno",
  aviso: "Necesita a una persona",
};

/** Estado como texto plano: lo pendiente en .t-status; lo listo, callado. */
function Estado({ fila }: { fila: FilaActividad }) {
  const texto = fila.estadoTexto ?? TEXTO_ESTADO[fila.estado];
  if (fila.estado === "listo") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.875rem] text-app-fg-2">
        <Icon name="check" size={14} strokeWidth={2} />
        {texto}
      </span>
    );
  }
  return <span className="t-status">{texto}</span>;
}

type Props = {
  fila: FilaActividad;
  /** A dónde lleva "Revisar" (solo si hay algo pendiente). */
  href: string;
  /** En una hoja angosta (avisos): siempre en la composición de celular. */
  compacta?: boolean;
  onNavigate?: () => void;
};

/**
 * Una fila de actividad: personaje, lo que hizo, la hora, el estado y, si espera
 * a la persona, "Revisar". En computadora van en columnas; en celular se apilan.
 */
export function ActivityRow({ fila, href, compacta = false, onNavigate }: Props) {
  const agente = getAgent(fila.agente);
  const pendiente = fila.estado !== "listo";
  const solo = compacta ? "" : "md:hidden";
  const columnas = compacta ? "hidden" : "hidden md:block";

  const revisar = pendiente ? (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={`Revisar: ${fila.accion}`}
      className={buttonClasses("secondary", "md", "-mr-4 h-11 shrink-0 md:h-10 light:mr-0")}
    >
      Revisar
    </Link>
  ) : null;

  return (
    <li className={cn("flex items-start gap-4 py-5", !compacta && "md:items-center md:gap-5 md:py-4")}>
      <AgentBlob agent={fila.agente} size={40} className="mt-0.5 md:mt-0" />

      <div className="min-w-0 flex-1">
        <p className="text-[1.0625rem] font-light leading-snug text-app-fg light:font-normal">{fila.accion}</p>
        <p className="mt-1 text-[0.875rem] text-app-fg-2">
          {agente.name} · {agente.area}
          <span className={solo}>
            {" · "}
            <time className="t-num">{fila.hora}</time>
          </span>
        </p>
        {fila.detalle && <p className="mt-1 text-[0.875rem] text-app-fg-2">{fila.detalle}</p>}
        <div className={cn("mt-3 flex items-center justify-between gap-3", solo)}>
          <Estado fila={fila} />
          {revisar}
        </div>
      </div>

      {!compacta && (
        <>
          <time className={cn(columnas, "w-[84px] shrink-0 text-right text-[0.875rem] text-app-fg-2 t-num")}>
            {fila.hora}
          </time>
          <div className={cn(columnas, "w-[210px] shrink-0")}>
            <Estado fila={fila} />
          </div>
          <div className={cn(columnas, "w-[104px] shrink-0 text-right")}>{revisar}</div>
        </>
      )}
    </li>
  );
}
