"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenis: Lenis | null = null;

/** Instancia activa de Lenis (null en celular o con "reducir movimiento"). */
export function getLenis() {
  return lenis;
}

/** Detiene / reanuda el scroll (menús y fichas abiertas). */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/**
 * Scroll suave solo en computadora (puntero fino y ≥ 1024px) y sin
 * "reducir movimiento". En celular queda el scroll nativo.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tick = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis || !desktop.matches || reduce.matches) return;
      lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };
    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
    };
    const sync = () => (desktop.matches && !reduce.matches ? start() : stop());

    sync();
    desktop.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      stop();
    };
  }, []);

  // Al cambiar de página, arriba y sin animación.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
