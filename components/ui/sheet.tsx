"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { lockScroll } from "@/components/motion/smooth-scroll";
import { Icon } from "./icon";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  /** Título accesible (visible si showTitle). */
  title: string;
  showTitle?: boolean;
  /** right: panel lateral · bottom: hoja desde abajo (celular) · auto: abajo en celular, lateral en computadora */
  side?: "right" | "bottom" | "auto";
  className?: string;
  children: ReactNode;
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

/**
 * Panel modal con entrada ease-out (480ms) y salida más rápida (220ms).
 * Atrapa el foco, cierra con Esc o tocando fuera, y devuelve el foco al cerrar.
 */
export function Sheet({ open, onClose, title, showTitle = false, side = "auto", className, children }: SheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      lockScroll(true);
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => {
      setMounted(false);
      lockScroll(false);
      lastFocus.current?.focus?.();
    }, 230);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!visible) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus() ?? panel?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  if (!mounted) return null;

  const placement =
    side === "right"
      ? "inset-y-0 right-0 w-full max-w-[520px]"
      : side === "bottom"
        ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[28px]"
        : "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[28px] md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-full md:max-w-[520px] md:rounded-none";

  const hidden =
    side === "right"
      ? "translate-x-10 opacity-0"
      : side === "bottom"
        ? "translate-y-10 opacity-0"
        : "translate-y-10 opacity-0 md:translate-y-0 md:translate-x-10";

  return createPortal(
    <div className="fixed inset-0 z-[80]" data-lenis-prevent>
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity",
          visible ? "opacity-100 duration-500 ease-out" : "opacity-0 duration-200 ease-in",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col overflow-y-auto bg-canvas text-ink outline-none",
          "light:border-l light:border-line",
          placement,
          "transition-[transform,opacity]",
          visible ? "translate-x-0 translate-y-0 opacity-100 duration-500 ease-out" : cn(hidden, "duration-200 ease-in"),
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-5">
          {showTitle ? <p className="t-label">{title}</p> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-ink/[0.07] hover:text-ink active:bg-ink/[0.12]"
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 px-6 pb-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
