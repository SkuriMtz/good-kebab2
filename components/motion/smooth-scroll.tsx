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
    const desktop = window.matchMedia("(pointer: fine) and (hover: hover) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tick = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis || !desktop.matches || reduce.matches) return;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        anchors: true,
        stopInertiaOnNavigate: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };
    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
      gsap.ticker.lagSmoothing(500, 33);
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

  // Al cambiar de página: arriba y sin animación, o directo al ancla si la dirección trae una (/#lista, /#precios…).
  // Sin esto, en computadora el salto a 0 pisaba el salto al ancla que hace el navegador.
  useEffect(() => {
    let id = window.location.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Ancla mal escrita: se queda como viene.
    }
    const ir = () => {
      const el = id ? document.getElementById(id) : null;
      if (!el) lenis?.scrollTo(0, { immediate: true, force: true });
      else if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
      else el.scrollIntoView({ block: "start" });
    };
    ir();
    ScrollTrigger.refresh();
    if (!id) return;

    // La portada cambia de alto justo después de montar (el hero se fija en computadora): se vuelve a
    // apuntar al ancla, salvo que la persona ya haya empezado a mover la página.
    const timers = [150, 450].map((ms) => window.setTimeout(ir, ms));
    const soltar = () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("wheel", soltar);
      window.removeEventListener("touchstart", soltar);
      window.removeEventListener("keydown", soltar);
    };
    window.addEventListener("wheel", soltar, { passive: true });
    window.addEventListener("touchstart", soltar, { passive: true });
    window.addEventListener("keydown", soltar);
    return soltar;
  }, [pathname]);

  return null;
}
