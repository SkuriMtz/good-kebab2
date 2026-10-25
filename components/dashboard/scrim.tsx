"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Velo que baja la voz de la página mientras un menú o una lista está abierta.
 * Va debajo de la barra (z-40 < z-50) y se cierra al tocarlo. Solo opacidad.
 */
export function Scrim({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return null;
  return createPortal(
    <div
      aria-hidden="true"
      onClick={onClick}
      className={cn(
        "fixed inset-0 z-40 bg-black/80 transition-opacity light:bg-black/25",
        visible ? "opacity-100 duration-300 ease-out" : "pointer-events-none opacity-0 duration-200 ease-in",
      )}
    />,
    document.body,
  );
}
