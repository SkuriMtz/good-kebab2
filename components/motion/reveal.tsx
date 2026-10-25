"use client";

import { useEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Fracción visible para disparar (0–1). */
  threshold?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * Revela una sola vez las piezas marcadas con `data-r` dentro de este bloque,
 * en orden (título → texto → resto), escalonadas 70ms. Sin JS se ve todo.
 *
 *   <Reveal as="section">
 *     <h2 data-r>…</h2>
 *     <p data-r>…</p>
 *   </Reveal>
 */
export function Reveal<T extends ElementType = "div">({ as, threshold = 0, ...rest }: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-r]").forEach((item, i) => {
      if (!item.style.getPropertyValue("--i")) item.style.setProperty("--i", String(i));
    });
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -14% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return <Tag ref={ref} {...rest} />;
}
