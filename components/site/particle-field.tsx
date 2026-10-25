"use client";

import { useEffect, useRef } from "react";

type Tri = { x: number; y: number; s: number; r: number; vx: number; vy: number; vr: number; c: number; a: number };

// Violeta, ámbar, verde azulado, magenta, azul y blanco (constelación de Dala).
const PALETTE = {
  dark: ["#8052ff", "#ffb829", "#1fb89a", "#ff5a8a", "#4d7dff", "#ffffff"],
  light: ["#8052ff", "#ffb829", "#15846e", "#ff5a8a", "#0071e3", "#1d1d1f"],
};

/**
 * Solo en modo oscuro (en claro --particle-alpha es 0 y el canvas se oculta).
 * Fragmentos de triangulitos al fondo: fijos, pocos, de brillo bajo y sin
 * destellos. Se mueven apenas (deriva muy lenta); con "reducir movimiento"
 * quedan quietos. Nunca tapan el texto: van detrás de todo.
 */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let tris: Tri[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let colors = PALETTE.dark;
    let alpha = 0.3;

    const readTheme = () => {
      const light = document.documentElement.getAttribute("data-theme") === "light";
      colors = light ? PALETTE.light : PALETTE.dark;
      const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--particle-alpha"));
      alpha = Number.isFinite(v) ? v : 0.3;
    };

    const seed = () => {
      const count = Math.max(22, Math.min(64, Math.round((w * h) / 24000)));
      tris = Array.from({ length: count }, () => {
        // Más hacia las orillas que al centro, donde vive el texto.
        let x = Math.random() * w;
        if (Math.random() < 0.55) x = Math.random() < 0.5 ? Math.random() * w * 0.22 : w - Math.random() * w * 0.22;
        return {
          x,
          y: Math.random() * h,
          s: 3 + Math.random() * 5.5,
          r: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.06,
          vy: -0.02 - Math.random() * 0.05,
          vr: (Math.random() - 0.5) * 0.002,
          c: Math.floor(Math.random() * 6),
          a: 0.35 + Math.random() * 0.65,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!tris.length) seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const t of tris) {
        ctx.globalAlpha = t.a * alpha;
        ctx.strokeStyle = colors[t.c];
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const ang = t.r + (k * Math.PI * 2) / 3;
          const px = t.x + Math.cos(ang) * t.s;
          const py = t.y + Math.sin(ang) * t.s;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const t of tris) {
        t.x += t.vx;
        t.y += t.vy;
        t.r += t.vr;
        if (t.y < -12) t.y = h + 12;
        if (t.x < -12) t.x = w + 12;
        if (t.x > w + 12) t.x = -12;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches || document.hidden) draw();
      else raf = requestAnimationFrame(step);
    };

    readTheme();
    resize();
    play();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        draw();
      }, 150);
    };
    const themeObserver = new MutationObserver(() => {
      readTheme();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", play);
    reduce.addEventListener("change", play);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", play);
      reduce.removeEventListener("change", play);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 [view-transition-name:site-bg] light:hidden"
    />
  );
}
