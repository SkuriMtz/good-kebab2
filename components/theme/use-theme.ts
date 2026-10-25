"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "atendel-tema";
const EVENT = "atendel:tema";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Sin almacenamiento: el tema dura lo que dure la página.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

/** Tema actual y una función para alternarlo con un fundido corto. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    if (!doc.startViewTransition || reduce) {
      applyTheme(next);
      return;
    }
    const root = document.documentElement;
    root.setAttribute("data-vt", "theme");
    const vt = doc.startViewTransition(() => applyTheme(next));
    vt.finished.finally(() => root.removeAttribute("data-vt"));
  }, []);

  return { theme, toggle };
}
