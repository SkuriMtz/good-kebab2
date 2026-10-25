"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Aviso flotante con "Deshacer". Es lo único que flota sobre el contenido, así que
 * lleva relleno sólido (tinta sobre el lienzo) para que se lea sobre cualquier cosa.
 */
export function UndoToast({ toast, onUndo }: { toast: { id: string; titulo: string } | null; onUndo: (id: string) => void }) {
  const [shown, setShown] = useState<{ id: string; titulo: string } | null>(toast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setShown(toast);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = window.setTimeout(() => setShown(null), 240);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!shown) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[90] flex justify-center px-4">
      <div
        role="status"
        className={cn(
          "pointer-events-auto flex max-w-full items-center gap-4 rounded-[24px] bg-chat-fg py-2 pl-5 pr-2 text-chat-bg light:rounded-full",
          "transition-[opacity,transform] motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100 duration-500 ease-out" : "translate-y-3 opacity-0 duration-200 ease-in",
        )}
      >
        <p className="min-w-0 truncate text-[0.9375rem] font-normal">
          Borraste «{shown.titulo}»
        </p>
        <button
          type="button"
          onClick={() => onUndo(shown.id)}
          className="inline-flex h-11 shrink-0 items-center rounded-full px-4 text-[0.9375rem] font-semibold underline underline-offset-4 transition-colors duration-200 hover:bg-chat-bg/15 active:translate-y-px active:bg-chat-bg/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Deshacer
        </button>
      </div>
    </div>
  );
}
