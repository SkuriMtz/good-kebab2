"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { AGENTS, getAgent, type AgentId } from "@/lib/agents";
import { cn } from "@/lib/cn";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useTablero } from "./context";
import { normalizar } from "./format";
import { textoBloqueado } from "./plan";
import { hrefAgente } from "./rutas";

/** Comando con "/" → agente que lo atiende (textos.md §9). */
const COMANDO_A_AGENTE: Record<string, AgentId> = {
  agendar: "lola",
  recordar: "lola",
  resumir: "clara",
  investigar: "iris",
  redactar: "iris",
  reporte: "iris",
};

/** Una mención en curso: "@" justo antes del cursor, con lo que lleva escrito. */
function mencionEnCurso(texto: string, cursor: number) {
  const m = /(^|\s)@([\p{L}]*)$/u.exec(texto.slice(0, cursor));
  return m ? { consulta: m[2], inicio: cursor - m[2].length - 1 } : null;
}

/**
 * "Pídele algo a tu equipo o escribe @ para elegir agente".
 * Al escribir @ aparece la lista de agentes (↑ ↓ Enter, Esc). Al enviar abre el chat con
 * `?q=<texto>&agente=<id>` (el prefijo es /pruebalo o nada).
 */
export function Composer() {
  const t = useTablero();
  const router = useTransitionRouter();
  const uid = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const [texto, setTexto] = useState("");
  const [agente, setAgente] = useState<AgentId | null>(null);
  const [mencion, setMencion] = useState<{ consulta: string; inicio: number } | null>(null);
  const [activo, setActivo] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const opciones = useMemo(() => {
    if (!mencion) return [];
    const n = normalizar(mencion.consulta);
    return AGENTS.filter((a) => !n || normalizar(a.name).startsWith(n));
  }, [mencion]);

  const abierta = mencion !== null && opciones.length > 0;

  useEffect(() => setActivo(0), [mencion?.consulta]);

  // La caja crece con lo que escribes (hasta un tope).
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [texto]);

  const elegir = useCallback(
    (id: AgentId) => {
      if (!t.disponibles.includes(id) || !mencion) return;
      const nuevo = texto.slice(0, mencion.inicio) + texto.slice(mencion.inicio + 1 + mencion.consulta.length);
      setTexto(nuevo);
      setAgente(id);
      setMencion(null);
      requestAnimationFrame(() => {
        area.current?.focus();
        area.current?.setSelectionRange(mencion.inicio, mencion.inicio);
      });
    },
    [mencion, t.disponibles, texto],
  );

  const insertarArroba = () => {
    const el = area.current;
    if (!el) return;
    const pos = el.selectionStart ?? texto.length;
    const antes = texto.slice(0, pos);
    const sep = antes && !/\s$/.test(antes) ? " " : "";
    const nuevo = `${antes}${sep}@${texto.slice(pos)}`;
    const cursor = antes.length + sep.length + 1;
    setTexto(nuevo);
    setMencion({ consulta: "", inicio: cursor - 1 });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  /** A quién va: el que elegiste con @; si no, el del comando "/"; si no, el primero de tu equipo. */
  const destino = (): AgentId | "grupo" => {
    if (agente) return agente;
    const cmd = /^\s*\/([\p{L}]+)/u.exec(texto);
    const delComando = cmd ? COMANDO_A_AGENTE[normalizar(cmd[1])] : undefined;
    if (delComando && t.disponibles.includes(delComando)) return delComando;
    return t.disponibles.includes("lola") ? "lola" : (t.disponibles[0] ?? "clara");
  };

  const enviar = () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    router.push(hrefAgente(t.rutas, destino(), limpio));
    // Si la navegación tarda o se cancela, la caja vuelve a quedar disponible.
    window.setTimeout(() => setEnviando(false), 4000);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (abierta) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const n = opciones.length;
        setActivo((a) => (e.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        elegir(opciones[activo].id);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMencion(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    } else if (e.key === "Backspace" && texto === "" && agente) {
      setAgente(null);
    }
  };

  const hay = texto.trim().length > 0;
  const listaId = `${uid}-menciones`;
  const ficha = agente ? getAgent(agente) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      className="relative"
    >
      <div
        className={cn(
          "rounded-[24px] bg-app-field p-2 transition-[border-color,background-color] duration-200 ease-out",
          "light:rounded-[32px] light:border light:border-line-strong light:hover:border-app-fg",
          "has-[textarea:focus-visible]:outline has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-brand",
        )}
      >
        <div className="flex items-start gap-3 px-4 pb-1 pt-3">
          {ficha && (
            <button
              type="button"
              onClick={() => {
                setAgente(null);
                area.current?.focus();
              }}
              aria-label={`Quitar a ${ficha.name}. Está elegida para este pedido`}
              className="mt-0.5 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-app-fg/10 pl-1.5 pr-3 text-[0.9375rem] font-normal text-app-fg transition-[background-color,transform] duration-200 hover:bg-app-fg/[0.18] active:translate-y-px"
            >
              <AgentBlob agent={ficha.id} size={22} />@{ficha.name}
            </button>
          )}
          <label htmlFor={`${uid}-texto`} className="sr-only">
            Pídele algo a tu equipo
          </label>
          <textarea
            ref={area}
            id={`${uid}-texto`}
            rows={2}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setMencion(mencionEnCurso(e.target.value, e.target.selectionStart ?? e.target.value.length));
            }}
            onClick={(e) => setMencion(mencionEnCurso(texto, e.currentTarget.selectionStart ?? texto.length))}
            onKeyDown={onKeyDown}
            onBlur={() => setMencion(null)}
            role="combobox"
            aria-expanded={abierta}
            aria-controls={listaId}
            aria-autocomplete="list"
            aria-activedescendant={abierta ? `${uid}-op-${activo}` : undefined}
            placeholder="Pídele algo a tu equipo o escribe @ para elegir agente"
            maxLength={4000}
            className="min-h-[56px] w-full resize-none bg-transparent text-[1.0625rem] leading-relaxed text-app-fg placeholder:text-app-fg-2 focus:outline-none sm:text-[1.125rem]"
          />
        </div>

        <div className="flex items-center justify-between px-2 pb-1 pt-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertarArroba}
            aria-label="Elegir un agente con @"
            title="Elegir un agente con @"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-app-fg-2 transition-[background-color,color,transform] duration-200 ease-out hover:bg-app-fg/[0.08] hover:text-app-fg active:translate-y-px active:bg-app-fg/[0.14]"
          >
            <Icon name="at" size={22} />
          </button>

          <button
            type="submit"
            disabled={!hay || enviando}
            aria-label={enviando ? "Enviando" : "Enviar al chat"}
            aria-busy={enviando || undefined}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,color,transform,opacity] duration-200 ease-out active:translate-y-px",
              hay ? "bg-brand text-white hover:bg-brand-hover active:bg-brand-press" : "bg-app-fg/10 text-app-fg-2",
              "disabled:pointer-events-none disabled:opacity-60",
            )}
          >
            {enviando ? <Spinner size={20} /> : <Icon name="arrowUp" size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <ul
        id={listaId}
        role="listbox"
        aria-label="Agentes"
        aria-hidden={!abierta}
        className={cn(
          "absolute left-0 right-0 top-full z-20 mt-2 rounded-[24px] bg-app-card p-2 light:rounded-[28px] light:border light:border-app-line",
          "transition-[opacity,transform,visibility]",
          abierta
            ? "visible translate-y-0 opacity-100 duration-300 ease-out"
            : "invisible -translate-y-1 opacity-0 duration-200 ease-in",
        )}
      >
        {opciones.map((a, i) => {
          const libre = t.disponibles.includes(a.id);
          return (
            <li
              key={a.id}
              id={`${uid}-op-${i}`}
              role="option"
              aria-selected={i === activo}
              aria-disabled={!libre || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => i !== activo && setActivo(i)}
              onClick={() => elegir(a.id)}
              className={cn(
                "group flex min-h-12 items-center gap-3 rounded-[16px] px-3 py-2 text-app-fg-2 transition-colors duration-150",
                "aria-selected:text-app-fg light:aria-selected:bg-app-bg",
                libre ? "cursor-pointer" : "cursor-not-allowed opacity-60",
              )}
            >
              <AgentBlob agent={a.id} size={32} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[1rem] font-normal group-aria-selected:font-semibold">{a.name}</span>
                <span className="block text-[0.8125rem]">{libre ? a.area : textoBloqueado(a.id, t.plan)}</span>
              </span>
              {!libre && <Icon name="lock" size={16} className="shrink-0" />}
            </li>
          );
        })}
      </ul>
    </form>
  );
}
