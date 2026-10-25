"use client";

import { useEffect, type RefObject } from "react";

/**
 * Cierra un menú o lista al tocar fuera de él o al pulsar Esc.
 * `ref` debe envolver el botón que lo abre y el propio menú.
 */
export function useDismiss(open: boolean, onClose: () => void, ref: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, ref]);
}
