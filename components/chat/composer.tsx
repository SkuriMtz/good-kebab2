"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { AGENTS, getAgent, type AgentId } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { COMMANDS, norm } from "@/lib/chat/commands";
import { MAX_ATTACH_BYTES } from "@/lib/chat/format";
import type { ChatTarget, GroupSummary } from "@/lib/chat/types";
import { AgentStack } from "./agent-stack";
import { OptionList, PopMenu, type MenuItem, type Option } from "./composer-menus";

export type Attachment = { nombre: string; contenido: string };

export type ComposerNotice = {
  tono: "error" | "info";
  texto: string;
  accion?: { label: string; onClick: () => void };
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  /** Hay una respuesta en camino. */
  busy: boolean;
  target: ChatTarget;
  onTarget: (t: ChatTarget) => void;
  allowed: AgentId[];
  groups: GroupSummary[];
  attachment: Attachment | null;
  onAttach: (a: Attachment | null) => void;
  onNewGroup: () => void;
  notice: ComposerNotice | null;
  textareaRef: RefObject<HTMLTextAreaElement>;
  /** Estado vacío: caja más amplia. */
  wide?: boolean;
};

type Token = { kind: "slash" | "mention"; start: number; end: number; query: string };

/** La palabra bajo el cursor si empieza con "/" (solo al inicio del mensaje) o con "@". */
function activeToken(value: string, caret: number): Token | null {
  const before = value.slice(0, caret);
  const m = /(^|\s)([/@])([\p{L}]*)$/u.exec(before);
  if (!m) return null;
  const start = before.length - m[2].length - m[3].length;
  const kind = m[2] === "/" ? "slash" : "mention";
  if (kind === "slash" && value.slice(0, start).trim() !== "") return null;
  return { kind, start, end: caret, query: m[3] };
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  target,
  onTarget,
  allowed,
  groups,
  attachment,
  onAttach,
  onNewGroup,
  notice,
  textareaRef,
  wide,
}: Props) {
  const [caret, setCaret] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState<null | "plus" | "agent">(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const composing = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const agentRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  /* ------------------------------ "/" y "@" ------------------------------ */
  const token = useMemo(() => activeToken(value, caret), [value, caret]);

  const options = useMemo<Option[]>(() => {
    if (!token) return [];
    const q = norm(token.query);
    if (token.kind === "slash") {
      return COMMANDS.filter((c) => c.id.startsWith(q)).map((c) => ({
        id: c.id,
        title: c.nombre,
        hint: allowed.includes(c.agent) ? `${c.descripcion} · ${getAgent(c.agent).name}` : `${getAgent(c.agent).name} no viene en tu plan`,
        leading: <AgentBlob agent={c.agent} size={34} />,
        disabled: !allowed.includes(c.agent),
      }));
    }
    return AGENTS.filter((a) => norm(a.name).startsWith(q)).map((a) => ({
      id: a.id,
      title: a.name,
      hint: allowed.includes(a.id) ? a.area : "No viene en tu plan",
      leading: <AgentBlob agent={a.id} size={34} />,
      disabled: !allowed.includes(a.id),
    }));
  }, [token, allowed]);

  const popupOpen = !!token && options.length > 0 && !dismissed && menu === null;

  useEffect(() => setActive(0), [token?.kind, token?.query]);

  const moveCaret = (pos: number) => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  };

  const pick = (i: number) => {
    const o = options[i];
    if (!o || o.disabled || !token) return;
    if (token.kind === "slash") {
      const cmd = COMMANDS.find((c) => c.id === o.id);
      if (!cmd) return;
      const insert = `${cmd.nombre} `;
      onChange(value.slice(0, token.start) + insert + value.slice(token.end));
      onTarget({ kind: "agente", agent: cmd.agent });
      moveCaret(token.start + insert.length);
    } else {
      const rest = value.slice(token.end).replace(/^ /, "");
      onChange(value.slice(0, token.start) + rest);
      onTarget({ kind: "agente", agent: o.id as AgentId });
      moveCaret(token.start);
    }
  };

  /* ------------------------------- Teclado ------------------------------- */
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (composing.current || e.nativeEvent.isComposing) return;
    if (popupOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % options.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + options.length) % options.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (!options[active]?.disabled) {
          e.preventDefault();
          pick(active);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setDismissed(true);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy) onSend();
    }
  };

  /* --------------------------- Caja que crece --------------------------- */
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 220;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value, textareaRef]);

  /* ------------------------------ Adjuntar ------------------------------ */
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const esTexto = file.type.startsWith("text/") || /\.(txt|md|csv|tsv|json)$/i.test(file.name);
    if (!esTexto || file.size > MAX_ATTACH_BYTES) {
      setAttachError("Por ahora solo leo archivos de texto (.txt, .md, .csv) de hasta 60 KB.");
      return;
    }
    try {
      onAttach({ nombre: file.name, contenido: await file.text() });
      setAttachError(null);
    } catch {
      setAttachError("No pude leer ese archivo. Prueba con otro.");
    }
  };

  /* ------------------------------- Menús ------------------------------- */
  const closeMenu = (restore: boolean) => {
    const from = menu;
    setMenu(null);
    if (restore) (from === "plus" ? plusRef : agentRef).current?.focus();
  };

  const plusItems: MenuItem[] = [
    {
      id: "adjuntar",
      title: "Adjuntar archivo",
      hint: "Texto: .txt, .md o .csv",
      leading: <Icon name="paperclip" size={22} />,
      onSelect: () => {
        setMenu(null);
        fileRef.current?.click();
      },
    },
    {
      id: "grupo",
      title: "Nuevo grupo",
      hint: "Agentes que se pasan el trabajo",
      leading: <Icon name="users" size={22} />,
      onSelect: () => {
        setMenu(null);
        onNewGroup();
      },
    },
  ];

  const agentItems: MenuItem[] = [
    ...AGENTS.map<MenuItem>((a) => ({
      id: a.id,
      title: a.name,
      hint: allowed.includes(a.id) ? a.area : "No viene en tu plan",
      leading: <AgentBlob agent={a.id} size={34} />,
      disabled: !allowed.includes(a.id),
      checked: target.kind === "agente" && target.agent === a.id,
      onSelect: () => {
        onTarget({ kind: "agente", agent: a.id });
        closeMenu(true);
      },
    })),
    ...groups.map<MenuItem>((g) => {
      const locked = g.agentes.some((a) => !allowed.includes(a));
      return {
        id: `g-${g.id}`,
        title: g.nombre,
        hint: locked ? "No viene en tu plan" : g.agentes.map((a) => getAgent(a).name).join(" + "),
        leading: <AgentStack agentes={g.agentes} size={34} />,
        disabled: locked,
        checked: target.kind === "grupo" && target.groupId === g.id,
        onSelect: () => {
          onTarget({ kind: "grupo", groupId: g.id });
          closeMenu(true);
        },
      };
    }),
  ];

  const targetGroup = target.kind === "grupo" ? groups.find((g) => g.id === target.groupId) : null;
  const targetName = target.kind === "agente" ? getAgent(target.agent).name : (targetGroup?.nombre ?? "Grupo");
  const canSend = (value.trim().length > 0 || !!attachment) && !busy;
  const shownNotice: ComposerNotice | null = attachError ? { tono: "error", texto: attachError } : notice;

  return (
    <div className={cn("w-full", wide ? "max-w-[820px]" : "max-w-[760px]")}>
      {popupOpen && (
        <div className="mb-3">
          <OptionList
            id={listId}
            label={token?.kind === "slash" ? "Comandos" : "Agentes"}
            options={options}
            active={active}
            onPick={pick}
            onHover={setActive}
          />
        </div>
      )}
      {menu === "plus" && (
        <div className="mb-3 max-w-[380px]">
          <PopMenu label="Más opciones" items={plusItems} onClose={closeMenu} anchorRef={plusRef} />
        </div>
      )}
      {menu === "agent" && (
        <div className="mb-3 max-w-[420px]">
          <PopMenu label="Elegir a quién le escribes" items={agentItems} onClose={closeMenu} anchorRef={agentRef} />
        </div>
      )}

      {shownNotice && (
        <p
          role={shownNotice.tono === "error" ? "alert" : "status"}
          className={cn(
            "mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-[0.9375rem] font-normal leading-snug",
            shownNotice.tono === "error" ? "text-danger" : "text-chat-fg-2",
          )}
        >
          <span>{shownNotice.texto}</span>
          {shownNotice.accion && (
            <button
              type="button"
              onClick={shownNotice.accion.onClick}
              className="inline-flex min-h-[44px] items-center rounded-full px-2 font-semibold text-chat-fg underline underline-offset-4 transition-opacity duration-200 hover:opacity-80 active:translate-y-px"
            >
              {shownNotice.accion.label}
            </button>
          )}
        </p>
      )}

      <div
        className={cn(
          "rounded-[24px] bg-chat-composer px-3 pb-2.5 pt-3.5 transition-[border-color,outline-color] duration-200 sm:px-4",
          "light:rounded-[28px] light:border light:border-line-strong light:hover:border-chat-fg",
          "has-[textarea:focus-visible]:outline has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-[3px] has-[textarea:focus-visible]:outline-brand",
        )}
      >
        {attachment && (
          <div className="mb-2 flex">
            <span className="inline-flex h-10 max-w-full items-center gap-2 rounded-full bg-chat-fg/10 pl-3.5 pr-1 text-[0.9375rem] font-normal text-chat-fg">
              <Icon name="paperclip" size={16} className="shrink-0" />
              <span className="min-w-0 truncate">{attachment.nombre}</span>
              <button
                type="button"
                onClick={() => onAttach(null)}
                aria-label={`Quitar ${attachment.nombre}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 hover:bg-chat-fg/15 active:bg-chat-fg/25"
              >
                <Icon name="close" size={16} />
              </button>
            </span>
          </div>
        )}

        <label htmlFor={`${listId}-texto`} className="sr-only">
          Mensaje para tu equipo
        </label>
        <textarea
          ref={textareaRef}
          id={`${listId}-texto`}
          rows={1}
          value={value}
          placeholder="Pídele algo a tu equipo…"
          enterKeyHint="send"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={popupOpen ? listId : undefined}
          aria-activedescendant={popupOpen ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            setDismissed(false);
            setCaret(e.target.selectionStart);
            onChange(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => setCaret(e.currentTarget.selectionStart)}
          onClick={(e) => setCaret(e.currentTarget.selectionStart)}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          onCompositionStart={() => (composing.current = true)}
          onCompositionEnd={() => (composing.current = false)}
          className="block w-full resize-none bg-transparent px-1.5 text-[1.0625rem] font-normal leading-[1.55] text-chat-fg placeholder:text-chat-fg-2 focus:outline-none focus-visible:outline-none"
        />

        <div className="mt-1.5 flex items-center gap-1">
          <button
            ref={plusRef}
            type="button"
            aria-label="Más opciones: adjuntar archivo o crear un grupo"
            aria-haspopup="menu"
            aria-expanded={menu === "plus"}
            onClick={() => setMenu((m) => (m === "plus" ? null : "plus"))}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-chat-fg-2 transition-[background-color,color,transform] duration-200 hover:bg-chat-fg/10 hover:text-chat-fg active:translate-y-px active:bg-chat-fg/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Icon name="plus" size={22} className={cn("transition-transform duration-200 motion-reduce:transition-none", menu === "plus" && "rotate-45")} />
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv,.tsv,.json,text/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFile} />

          <button
            ref={agentRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === "agent"}
            aria-label={`Le escribes a ${targetName}. Cambiar`}
            onClick={() => setMenu((m) => (m === "agent" ? null : "agent"))}
            className="inline-flex h-11 min-w-0 items-center gap-2 rounded-full pl-1.5 pr-3 text-[1rem] font-semibold text-chat-fg transition-[background-color,transform] duration-200 hover:bg-chat-fg/10 active:translate-y-px active:bg-chat-fg/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {target.kind === "agente" ? <AgentBlob agent={target.agent} size={30} /> : <AgentStack agentes={targetGroup?.agentes ?? []} size={30} />}
            <span className="truncate">{targetName}</span>
            <Icon name="chevronDown" size={16} className="shrink-0 text-chat-fg-2" />
          </button>

          <span className="flex-1" />

          <Button
            type="button"
            variant="primary"
            size="md"
            aria-label={busy ? "Detener la respuesta" : "Enviar mensaje"}
            disabled={!busy && !canSend}
            onClick={busy ? onStop : onSend}
            className="!h-11 !w-11 shrink-0 !rounded-full !px-0"
          >
            {busy ? <Icon name="stop" size={20} strokeWidth={2} /> : <Icon name="arrowUp" size={22} strokeWidth={2} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

