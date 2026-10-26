"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { AGENTS, getAgent, type AgentId } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Icon } from "@/components/ui/icon";
import { useTablero } from "./context";
import { IconButton } from "./icon-button";
import { normalizar } from "./format";
import { textoBloqueado } from "./plan";
import { hrefAgente, hrefConversacion, hrefGrupo } from "./rutas";
import { Scrim } from "./scrim";
import { useDismiss } from "./use-dismiss";

type Seccion = "Agentes" | "Grupos" | "Conversaciones";

type Resultado = {
  id: string;
  seccion: Seccion;
  titulo: string;
  meta: string;
  /** null = el agente no viene en el plan: se ve, pero no abre nada. */
  href: string | null;
  agentes: AgentId[];
};

const SECCIONES: Seccion[] = ["Agentes", "Grupos", "Conversaciones"];

/** Cuántos mensajes recientes se ofrecen antes de escribir nada. */
const SIN_BUSQUEDA = 3;

/**
 * Buscador de la barra: filtra agentes, grupos y conversaciones de los datos.
 * La tecla "/" lo enfoca. En celular es un ícono que abre la barra de búsqueda.
 */
export function Search() {
  const t = useTablero();
  const router = useTransitionRouter();
  const pathname = usePathname();
  const uid = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [movil, setMovil] = useState(false);
  const [activo, setActivo] = useState(0);

  const resultados = useMemo<Resultado[]>(() => {
    const n = normalizar(q);
    const coincide = (...campos: string[]) => !n || campos.some((c) => normalizar(c).includes(n));
    const out: Resultado[] = [];

    for (const a of AGENTS) {
      if (!coincide(a.name, a.area, a.line)) continue;
      const libre = t.disponibles.includes(a.id);
      out.push({
        id: `agente-${a.id}`,
        seccion: "Agentes",
        titulo: a.name,
        meta: libre ? a.area : `${a.area} · ${textoBloqueado(a.id, t.plan)}`,
        href: libre ? hrefAgente(t.rutas, a.id) : null,
        agentes: [a.id],
      });
    }
    for (const g of t.grupos) {
      const nombres = g.agentes.map((id) => getAgent(id).name).join(" + ");
      if (!coincide(g.nombre, nombres, g.descripcion ?? "")) continue;
      out.push({
        id: `grupo-${g.id}`,
        seccion: "Grupos",
        titulo: g.nombre,
        meta: nombres,
        href: hrefGrupo(t.rutas, g),
        agentes: g.agentes,
      });
    }
    const conv = t.conversaciones.filter((c) => coincide(c.titulo, c.ultimo ?? ""));
    for (const c of n ? conv : conv.slice(0, SIN_BUSQUEDA)) {
      out.push({
        id: `conv-${c.id}`,
        seccion: "Conversaciones",
        titulo: c.titulo,
        meta: c.ultimo || c.agentes.map((id) => getAgent(id).name).join(" + "),
        href: hrefConversacion(t.rutas, c),
        agentes: c.agentes,
      });
    }
    return out;
  }, [q, t]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setMovil(false);
    setQ("");
    campo.current?.blur();
  }, []);

  useDismiss(abierto || movil, cerrar, raiz);
  useEffect(() => cerrar(), [pathname, cerrar]);
  useEffect(() => setActivo(0), [q]);

  // En celular, al abrir la barra de búsqueda el cursor ya está dentro.
  useEffect(() => {
    if (movil) requestAnimationFrame(() => campo.current?.focus());
  }, [movil]);

  // "/" enfoca el buscador (salvo escribiendo en un campo o con una hoja abierta).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      e.preventDefault();
      if (window.matchMedia("(min-width: 768px)").matches) campo.current?.focus();
      else setMovil(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // La opción activa siempre a la vista.
  useEffect(() => {
    if (!abierto) return;
    lista.current?.querySelector<HTMLElement>(`[data-i="${activo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activo, abierto]);

  const ir = (r: Resultado | undefined) => {
    if (!r?.href) return;
    router.push(r.href);
    cerrar();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = resultados.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setAbierto(true);
      if (n) setActivo((a) => (e.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n));
    } else if (e.key === "Enter") {
      if (abierto && n) {
        e.preventDefault();
        ir(resultados[activo]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (q) setQ("");
      else cerrar();
    }
  };

  const listaId = `${uid}-lista`;
  const visible = abierto;
  let indice = -1;

  return (
    <>
      <div
        ref={raiz}
        className={cn(
          "min-w-0 md:ml-6 md:block md:max-w-[520px] md:flex-1",
          movil
            ? "max-md:absolute max-md:inset-0 max-md:z-10 max-md:flex max-md:items-center max-md:gap-1 max-md:bg-app-bar max-md:px-2 light:max-md:border-b light:max-md:border-app-line"
            : "hidden",
        )}
      >
        {movil && (
          <IconButton label="Cerrar la búsqueda" onClick={cerrar} className="md:hidden">
            <Icon name="arrowLeft" size={22} />
          </IconButton>
        )}

        <div className="max-md:static max-md:flex-1 md:relative">
          <label htmlFor={`${uid}-campo`} className="sr-only">
            Buscar agentes, grupos y conversaciones
          </label>
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-app-fg-2"
          />
          <input
            ref={campo}
            id={`${uid}-campo`}
            type="text"
            role="combobox"
            aria-expanded={visible}
            aria-controls={listaId}
            aria-autocomplete="list"
            aria-activedescendant={visible && resultados.length ? `${uid}-op-${activo}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Buscar agentes, grupos y conversaciones"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            onKeyDown={onKeyDown}
            className={cn(
              "h-10 w-full rounded-field bg-app-field pl-11 pr-4 text-[0.9375rem] font-normal text-app-fg placeholder:text-app-fg-2",
              "transition-[border-color,background-color] duration-200 ease-out",
              "light:border light:border-line-strong light:hover:border-app-fg",
              "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            )}
          />

          <div
            id={listaId}
            aria-hidden={!visible}
            className={cn(
              "absolute z-20 max-h-[min(72dvh,560px)] overflow-y-auto rounded-[24px] bg-app-card p-2 light:rounded-[20px] light:border light:border-app-line",
              "max-md:left-2 max-md:right-2 max-md:top-full max-md:mt-1 md:left-0 md:right-0 md:top-full md:mt-2",
              "transition-[opacity,transform,visibility]",
              visible
                ? "visible translate-y-0 opacity-100 duration-300 ease-out"
                : "invisible -translate-y-1 opacity-0 duration-200 ease-in",
            )}
            data-lenis-prevent
          >
            <ul ref={lista} role="listbox" aria-label="Resultados">
              {resultados.length === 0 ? (
                <li role="presentation" className="px-3 py-6 text-[0.9375rem] text-app-fg-2">
                  No encontramos nada con “{q.trim()}”.
                </li>
              ) : (
                SECCIONES.map((seccion) => {
                  const filas = resultados.filter((r) => r.seccion === seccion);
                  if (!filas.length) return null;
                  return (
                    <li key={seccion} role="presentation">
                      <p className="px-3 pb-1 pt-3 text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-app-fg-2 light:normal-case light:tracking-normal">
                        {seccion}
                      </p>
                      <ul role="group" aria-label={seccion}>
                        {filas.map((r) => {
                          indice += 1;
                          const i = indice;
                          return (
                            <li
                              key={r.id}
                              id={`${uid}-op-${i}`}
                              data-i={i}
                              role="option"
                              aria-selected={i === activo}
                              aria-disabled={!r.href || undefined}
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseMove={() => i !== activo && setActivo(i)}
                              onClick={() => ir(r)}
                              className={cn(
                                "group flex min-h-12 items-center gap-3 rounded-[16px] px-3 py-2 text-app-fg-2 transition-colors duration-150",
                                "aria-selected:text-app-fg light:aria-selected:bg-app-bg",
                                r.href ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                              )}
                            >
                              <span className="flex shrink-0 -space-x-2">
                                {r.agentes.slice(0, 2).map((id) => (
                                  <AgentBlob key={id} agent={id} size={28} />
                                ))}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[0.9375rem] font-normal group-aria-selected:font-semibold">
                                  {r.titulo}
                                </span>
                                <span className="block truncate text-[0.8125rem]">{r.meta}</span>
                              </span>
                              {r.href ? (
                                <Icon
                                  name="arrowRight"
                                  size={16}
                                  className="shrink-0 opacity-0 transition-opacity duration-150 group-aria-selected:opacity-100"
                                />
                              ) : (
                                <Icon name="lock" size={16} className="shrink-0" />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })
              )}
            </ul>
            <p className="sr-only" role="status" aria-live="polite">
              {visible ? `${resultados.length} resultados` : ""}
            </p>
          </div>
        </div>
      </div>

      <IconButton label="Buscar" onClick={() => setMovil(true)} className="max-md:ml-auto md:hidden">
        <Icon name="search" size={21} />
      </IconButton>

      <Scrim visible={visible || movil} onClick={cerrar} />
    </>
  );
}
