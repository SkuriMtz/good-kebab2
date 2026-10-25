"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export type Prefill = { q?: string; agente?: string; grupo?: string };

/**
 * Lee ?q= (texto), ?agente= y ?grupo= (el panel manda ahí) y los entrega una sola vez.
 * Luego limpia la dirección para que al recargar no se vuelva a precargar.
 * Va dentro de <Suspense> porque useSearchParams lo exige en páginas estáticas.
 */
export function UrlPrefill({ onPrefill }: { onPrefill: (p: Prefill) => void }) {
  const params = useSearchParams();
  const q = params.get("q");
  const agente = params.get("agente");
  const grupo = params.get("grupo");
  const cb = useRef(onPrefill);
  cb.current = onPrefill;

  useEffect(() => {
    if (!q && !agente && !grupo) return;
    cb.current({ q: q ?? undefined, agente: agente ?? undefined, grupo: grupo ?? undefined });
    window.history.replaceState(null, "", window.location.pathname);
  }, [q, agente, grupo]);

  return null;
}
