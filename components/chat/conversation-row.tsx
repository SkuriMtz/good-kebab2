"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import type { ConversationSummary } from "@/lib/chat/types";
import { AgentStack } from "./agent-stack";

const REVEAL = 96;

type Props = {
  item: ConversationSummary;
  href: string;
  active: boolean;
  onDelete: (id: string) => void;
  onNavigate?: () => void;
};

/**
 * Fila de conversación. En táctil, deslizar a la izquierda muestra "Borrar";
 * en computadora, el bote de basura aparece al pasar el cursor o al enfocar.
 * Delete también borra con el teclado.
 */
export function ConversationRow({ item, href, active, onDelete, onNavigate }: Props) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; base: number; horizontal: boolean | null } | null>(null);
  const moved = useRef(false);
  const root = useRef<HTMLLIElement>(null);

  // Un toque fuera cierra la fila abierta.
  useEffect(() => {
    if (dx === 0 || dragging) return;
    const close = (e: Event) => {
      if (root.current && !root.current.contains(e.target as Node)) setDx(0);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [dx, dragging]);

  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    drag.current = { x: e.clientX, y: e.clientY, base: dx, horizontal: null };
    moved.current = false;
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (d.horizontal === null) {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
      d.horizontal = Math.abs(mx) > Math.abs(my);
      if (d.horizontal) setDragging(true);
    }
    if (!d.horizontal) {
      drag.current = null;
      return;
    }
    moved.current = true;
    setDx(Math.max(-REVEAL - 20, Math.min(0, d.base + mx)));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (d?.horizontal) setDx((v) => (v < -REVEAL / 2 ? -REVEAL : 0));
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Delete") {
      e.preventDefault();
      onDelete(item.id);
    }
  };

  const open = dx < -4;

  return (
    <li ref={root} className="relative overflow-hidden rounded-[20px]" onKeyDown={onKey}>
      {/* Lo que queda detrás al deslizar */}
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center" aria-hidden={!open}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => onDelete(item.id)}
          className="flex h-full w-full items-center justify-center gap-1.5 text-[0.9375rem] font-semibold text-danger transition-opacity duration-200 active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        >
          <Icon name="trash" size={18} />
          Borrar
        </button>
      </div>

      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
          if (moved.current || open) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
            if (open) setDx(0);
          }
        }}
        style={{ transform: `translateX(${dx}px)`, touchAction: "pan-y" }}
        className={cn(
          "group relative flex min-h-[64px] items-center gap-3.5 rounded-[20px] bg-chat-panel pl-3 pr-1.5",
          "transition-[transform,background-color] ease-out motion-reduce:transition-none",
          dragging ? "duration-0" : "duration-300",
          active ? "light:bg-chat-bg" : "light:hover:bg-chat-hover",
        )}
      >
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center gap-3.5 rounded-[20px] py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
        >
          <AgentStack agentes={item.agentes} size={42} />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-[1.125rem] leading-snug transition-colors duration-200",
                active
                  ? "font-semibold text-chat-fg"
                  : "font-normal text-ink-2 group-hover:text-chat-fg light:font-medium light:text-chat-fg",
              )}
            >
              {item.titulo}
            </span>
            {item.ultimo && (
              <span className="mt-0.5 block truncate text-[0.875rem] font-normal leading-snug text-chat-fg-2">{item.ultimo}</span>
            )}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Borrar la conversación «${item.titulo}»`}
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-chat-fg-2 transition-[opacity,color,background-color] duration-200",
            "opacity-0 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand",
            "light:hover:bg-chat-bg [@media(hover:none)]:sr-only [@media(hover:none)]:focus-visible:not-sr-only",
          )}
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
    </li>
  );
}
