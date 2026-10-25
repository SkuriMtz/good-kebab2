"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

/** Look compartido de las opciones: en oscuro se elige con color y peso; en claro, con una fila blanca. */
function rowClass(active: boolean, disabled?: boolean) {
  return cn(
    "flex min-h-[56px] w-full items-center gap-3.5 rounded-[20px] px-4 py-2 text-left transition-colors duration-150",
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
    active ? "text-chat-fg light:bg-chat-bg" : "text-ink-2 light:text-chat-fg",
  );
}

/** Envoltura de las listas: sin caja en oscuro; panel #f5f5f7 de 28px en claro. */
export const listShell = "rounded-card p-1 light:bg-chat-panel light:p-2";

/* ------------------------------------------------------------------ */
/* Lista de opciones del "/" y del "@": el foco se queda en la caja de */
/* escribir y la opción activa se anuncia con aria-activedescendant.   */
/* ------------------------------------------------------------------ */

export type Option = {
  id: string;
  title: ReactNode;
  hint?: string;
  leading?: ReactNode;
  disabled?: boolean;
};

export function OptionList({
  id,
  label,
  options,
  active,
  onPick,
  onHover,
}: {
  id: string;
  label: string;
  options: Option[];
  active: number;
  onPick: (index: number) => void;
  onHover: (index: number) => void;
}) {
  return (
    <ul id={id} role="listbox" aria-label={label} className={cn("flex flex-col", listShell)}>
      {options.map((o, i) => (
        <li
          key={o.id}
          id={`${id}-${i}`}
          role="option"
          aria-selected={i === active}
          aria-disabled={o.disabled || undefined}
          // Que el clic no le quite el foco a la caja de escribir.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => !o.disabled && onPick(i)}
          onMouseMove={() => onHover(i)}
          className={rowClass(i === active, o.disabled)}
        >
          {o.leading}
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-[1.0625rem] leading-snug", i === active ? "font-semibold" : "font-normal")}>
              {o.title}
            </span>
            {o.hint && <span className="mt-0.5 block truncate text-[0.9375rem] font-normal leading-snug text-chat-fg-2">{o.hint}</span>}
          </span>
          {o.disabled ? (
            <Icon name="lock" size={18} className="shrink-0 text-chat-fg-2" />
          ) : (
            i === active && <Icon name="arrowRight" size={18} className="shrink-0 text-chat-fg-2" />
          )}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Menú de botón ("+" y selector de agente): el foco entra al menú,    */
/* flechas, Inicio/Fin, Enter, Esc.                                    */
/* ------------------------------------------------------------------ */

export type MenuItem = {
  id: string;
  title: ReactNode;
  hint?: string;
  leading?: ReactNode;
  disabled?: boolean;
  /** Si está definido, el elemento es de selección única (menuitemradio). */
  checked?: boolean;
  onSelect: () => void;
};

export function PopMenu({
  label,
  items,
  onClose,
  anchorRef,
}: {
  label: string;
  items: MenuItem[];
  onClose: (restoreFocus: boolean) => void;
  anchorRef: RefObject<HTMLElement>;
}) {
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabled = () => items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  useEffect(() => {
    const first = items.findIndex((it) => it.checked && !it.disabled);
    const start = first >= 0 ? first : enabled()[0];
    refs.current[start]?.focus();
    const outside = (e: Event) => {
      const t = e.target as Node;
      if (root.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (from: number, dir: 1 | -1) => {
    const list = enabled();
    if (!list.length) return;
    const pos = list.indexOf(from);
    const next = list[(pos + dir + list.length) % list.length];
    refs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = refs.current.findIndex((r) => r === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(current, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(current, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      refs.current[enabled()[0]]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const list = enabled();
      refs.current[list[list.length - 1]]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    } else if (e.key === "Tab") {
      onClose(false);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div ref={root} role="menu" aria-label={label} onKeyDown={onKey} className={cn("flex flex-col", listShell)}>
      {items.map((it, i) => (
        <button
          key={it.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role={it.checked === undefined ? "menuitem" : "menuitemradio"}
          aria-checked={it.checked === undefined ? undefined : it.checked}
          aria-disabled={it.disabled || undefined}
          tabIndex={-1}
          onClick={() => {
            if (it.disabled) return;
            it.onSelect();
          }}
          className={cn(
            rowClass(!!it.checked, it.disabled),
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand",
            !it.disabled && "hover:text-chat-fg light:hover:bg-chat-bg",
          )}
        >
          {it.leading}
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-[1.0625rem] leading-snug", it.checked ? "font-semibold" : "font-normal")}>
              {it.title}
            </span>
            {it.hint && <span className="mt-0.5 block truncate text-[0.9375rem] font-normal leading-snug text-chat-fg-2">{it.hint}</span>}
          </span>
          {it.disabled ? (
            <Icon name="lock" size={18} className="shrink-0 text-chat-fg-2" />
          ) : (
            it.checked && <Icon name="check" size={18} className="shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}
