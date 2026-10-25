"use client";

import { useEffect } from "react";

/**
 * Marca cómo se navegó: con el gesto/botón de "atrás" el navegador ya anima,
 * así que la transición propia se apaga (data-nav="pop"); con un clic vuelve.
 * También avisa que la app montó (para no esconder contenido si falla JS).
 */
export function PageTransitions() {
  useEffect(() => {
    const root = document.documentElement;
    const onPop = () => {
      root.dataset.nav = "pop";
    };
    const onClick = () => {
      delete root.dataset.nav;
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick, true);
    (window as Window & { __atendelReady?: boolean }).__atendelReady = true;
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
