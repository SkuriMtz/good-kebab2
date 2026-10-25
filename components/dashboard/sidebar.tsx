"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Icon, type IconName } from "@/components/ui/icon";
import { useTablero } from "./context";
import { formatoNumero } from "./format";
import { NOMBRE_PLAN, textoBloqueado } from "./plan";
import { hrefAgente, hrefConversacion, hrefGrupo } from "./rutas";

/** Fila del lateral. Oscuro: la selección se nota por color y peso; claro: relleno suave (el lienzo del modo). */
const fila =
  "flex min-h-11 items-center gap-3 rounded-control px-3 text-[0.9375rem] transition-[background-color,color,transform] duration-200 ease-out active:translate-y-px";
const activa = "font-semibold text-app-fg light:bg-app-bg";
const reposo = "font-normal text-app-fg-2 hover:text-app-fg light:hover:bg-app-bg";

function Titulo({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-1 mt-9 px-3 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-app-fg-2 light:normal-case light:tracking-normal"
    >
      {children}
    </h2>
  );
}

/**
 * Contenido del lateral: Inicio, Actividad, tus agentes, grupos, conversaciones
 * y, al pie, el uso del plan. Sirve para la columna fija y para la hoja del celular.
 */
export function SidebarContent({
  onNavigate,
  columna = false,
}: {
  onNavigate?: () => void;
  /** true: columna fija (la lista se desplaza y el plan queda siempre a la vista). false: hoja del celular. */
  columna?: boolean;
}) {
  const t = useTablero();
  const pathname = usePathname();
  const esta = (href: string) => pathname === href || pathname === `${href}/`;

  const principales: { href: string; texto: string; icono: IconName; marca?: number }[] = [
    { href: t.rutas.inicio, texto: "Inicio", icono: "home" },
    { href: t.rutas.actividad, texto: "Actividad", icono: "activity", marca: t.avisos.length },
  ];

  const sobrePasado = t.limite !== null && t.usados >= t.limite;
  const uso =
    t.limite !== null
      ? `Plan ${NOMBRE_PLAN[t.plan]} · ${formatoNumero(t.usados)} de ${formatoNumero(t.limite)} mensajes este mes`
      : `Plan ${NOMBRE_PLAN[t.plan]} · ${formatoNumero(t.usados)} mensajes este mes`;

  const cuerpo = (
    <>
      <nav aria-label="Panel">
        <ul>
          {principales.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                onClick={onNavigate}
                aria-current={esta(p.href) ? "page" : undefined}
                className={cn(fila, esta(p.href) ? activa : reposo)}
              >
                <Icon name={p.icono} size={20} />
                {p.texto}
                {p.marca ? (
                  <span className="t-status t-num ml-auto" aria-label={`${p.marca} por revisar`}>
                    {p.marca}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="lat-agentes">
        <Titulo id="lat-agentes">Tus agentes</Titulo>
        <ul>
          {AGENTS.map((a) => {
            const libre = t.disponibles.includes(a.id);
            return (
              <li key={a.id}>
                {libre ? (
                  <Link href={hrefAgente(t.rutas, a.id)} onClick={onNavigate} className={cn(fila, reposo)}>
                    <AgentBlob agent={a.id} size={28} />
                    <span>{a.name}</span>
                    <span className="ml-auto text-[0.8125rem] font-normal text-app-fg-2">{a.area}</span>
                  </Link>
                ) : (
                  <div className={cn(fila, "cursor-not-allowed py-2 text-app-fg-2")} aria-disabled="true">
                    <AgentBlob agent={a.id} size={28} className="opacity-40" />
                    <span className="min-w-0 leading-tight">
                      <span className="block font-normal">{a.name}</span>
                      <span className="block text-[0.8125rem]">{textoBloqueado(a.id, t.plan)}</span>
                    </span>
                    <Icon name="lock" size={16} className="ml-auto shrink-0" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="lat-grupos">
        <Titulo id="lat-grupos">Grupos</Titulo>
        {t.grupos.length === 0 ? (
          <p className="px-3 text-[0.875rem] leading-snug text-app-fg-2">Todavía no tienes grupos.</p>
        ) : (
          <ul>
            {t.grupos.map((g) => (
              <li key={g.id}>
                <Link href={hrefGrupo(t.rutas, g)} onClick={onNavigate} className={cn(fila, reposo)}>
                  <span className="flex shrink-0 -space-x-2">
                    {g.agentes.slice(0, 2).map((id) => (
                      <AgentBlob key={id} agent={id} size={24} />
                    ))}
                  </span>
                  <span className="min-w-0 truncate">{g.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {t.disponibles.length > 1 && (
          <Link href={hrefAgente(t.rutas, "grupo")} onClick={onNavigate} className={cn(fila, reposo, "mt-1")}>
            <Icon name="plus" size={20} />
            Nuevo grupo
          </Link>
        )}
      </section>

      <section aria-labelledby="lat-conv">
        <Titulo id="lat-conv">Conversaciones</Titulo>
        {t.conversaciones.length === 0 ? (
          <p className="px-3 text-[0.875rem] leading-snug text-app-fg-2">Todavía no hay conversaciones.</p>
        ) : (
          <ul>
            {t.conversaciones.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={hrefConversacion(t.rutas, c)} onClick={onNavigate} className={cn(fila, reposo)}>
                  <AgentBlob agent={c.agentes[0] ?? "clara"} size={24} className="opacity-90" />
                  <span className="min-w-0 truncate">{c.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );

  const textoUso = (
    <p
      className={cn(
        "t-num text-[0.75rem] leading-snug [text-wrap:balance]",
        columna ? "shrink-0 px-6 pb-5 pt-3" : "mt-auto px-3 pb-2 pt-10",
        sobrePasado ? "font-semibold text-accent" : "text-app-fg-2",
      )}
    >
      {uso}
    </p>
  );

  if (columna) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4" data-lenis-prevent>
          {cuerpo}
        </div>
        {textoUso}
      </div>
    );
  }
  return (
    <div className="flex min-h-full flex-col">
      {cuerpo}
      {textoUso}
    </div>
  );
}
