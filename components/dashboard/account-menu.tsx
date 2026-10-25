"use client";

import { useCallback, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTablero } from "./context";
import { NOMBRE_PLAN } from "./plan";
import { Scrim } from "./scrim";
import { useDismiss } from "./use-dismiss";

const fila =
  "flex h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-[0.9375rem] font-normal text-app-fg-2 " +
  "transition-[background-color,color,transform] duration-200 ease-out hover:text-app-fg active:translate-y-px " +
  "light:hover:bg-app-bg light:active:bg-app-hover";

/**
 * Avatar de la barra. Abre: quién eres, tu plan (solo se ve; no se cambia aquí),
 * el cambio de tema y la salida. En la demostración, la salida es volver al sitio.
 */
export function AccountMenu() {
  const t = useTablero();
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback(() => setAbierto(false), []);
  useDismiss(
    abierto,
    () => {
      setAbierto(false);
      if (raiz.current?.contains(document.activeElement)) boton.current?.focus();
    },
    raiz,
  );

  const inicial = (t.nombre ?? t.email ?? "A").trim().charAt(0).toUpperCase() || "A";

  return (
    <>
      <div
        ref={raiz}
        className="relative"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) cerrar();
        }}
      >
        <button
          ref={boton}
          type="button"
          aria-label="Tu cuenta"
          title="Tu cuenta"
          aria-haspopup="true"
          aria-expanded={abierto}
          onClick={() => setAbierto((a) => !a)}
          className={cn(
            "ml-1 inline-flex h-11 w-11 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-app-fg/10 text-[0.9375rem] font-semibold text-app-fg",
            "transition-[background-color,transform] duration-200 ease-out hover:bg-app-fg/[0.18] active:translate-y-px active:bg-app-fg/[0.24] aria-expanded:bg-app-fg/[0.18]",
          )}
        >
          {inicial}
        </button>

        <div
          aria-label="Tu cuenta"
          aria-hidden={!abierto}
          className={cn(
            "absolute right-0 top-full z-30 mt-2 w-[min(300px,calc(100vw-24px))] rounded-[24px] bg-app-card p-2 light:rounded-[20px] light:border light:border-app-line",
            "transition-[opacity,transform,visibility]",
            abierto
              ? "visible translate-y-0 opacity-100 duration-300 ease-out"
              : "invisible -translate-y-1 opacity-0 duration-200 ease-in",
          )}
        >
          <div className="px-3 pb-3 pt-3">
            <p className="truncate text-[1.0625rem] font-normal text-app-fg">{t.nombre ?? "Tu cuenta"}</p>
            {(t.negocio || t.email) && (
              <p className="mt-0.5 truncate text-[0.875rem] text-app-fg-2">{t.negocio ?? t.email}</p>
            )}
            <p className="mt-2 text-[0.875rem] text-app-fg-2">
              Plan <span className="font-semibold text-app-fg">{NOMBRE_PLAN[t.plan]}</span>
            </p>
          </div>

          <ThemeToggle
            withLabel
            className="!h-11 !w-full !justify-start !gap-3 !rounded-[16px] !px-3 text-[0.9375rem]"
          />

          {t.demo ? (
            <>
              <Link href={t.rutas.sitio} className={fila} onClick={cerrar}>
                <Icon name="arrowLeft" size={20} />
                Volver al sitio
              </Link>
              <Link href={t.rutas.lista} className={fila} onClick={cerrar}>
                <Icon name="mail" size={20} />
                Únete a la lista
              </Link>
            </>
          ) : (
            <form action="/salir" method="post">
              <button type="submit" className={fila}>
                <Icon name="logout" size={20} />
                Salir
              </button>
            </form>
          )}
        </div>
      </div>
      <Scrim visible={abierto} onClick={cerrar} />
    </>
  );
}
