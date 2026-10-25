"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { buildCloud, type Cloud } from "./constellation-shapes";

/**
 * Colores de partícula (solo en canvas): violeta, ámbar, verde azulado, magenta, azul y blanco/ink.
 * En claro, tonos más profundos y opacidad algo mayor sobre blanco. El color de cada partícula es fijo
 * (así se pueden agrupar los trazos): 6 colores × 3 niveles de opacidad = 18 stroke() por cuadro.
 */
const PALETTE = {
  dark: ["#8052ff", "#ffb829", "#1fb89a", "#ff5a8a", "#4d7dff", "#ffffff"],
  light: ["#7d5cf2", "#f2a20c", "#15846e", "#e8396c", "#0071e3", "#1d1d1f"],
};
const LEVELS = { dark: [0.45, 0.65, 0.85], light: [0.7, 0.84, 0.95] };
const COLOR_WEIGHTS = [1, 1, 1, 1, 1, 0.4];
const LEVEL_WEIGHTS = [0.3, 0.45, 0.25];

/** Qué tanto del canvas ocupa la figura (el resto es aire para la dispersión). */
const FIT = 0.8;
const ENTRY_MS = 900;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function profileFor(width: number) {
  const wide = width >= 768;
  let count = width >= 1200 ? 3000 : wide ? 2200 : 1400;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4) count = Math.round(count * 0.7);
  return {
    count,
    sample: wide ? 384 : 256,
    side: (wide ? [5, 7] : [3.5, 5]) as [number, number],
    spread: wide ? 0.55 : 0.4,
    dprCap: wide ? 2 : 1.75,
  };
}

type Props = {
  /**
   * true: la portada se queda fija y el avance sale del scroll de toda la sección (computadora).
   * false: sin fijar; el avance sigue el paso de la figura por la pantalla (celular).
   */
  pinned: boolean;
};

/**
 * Figura del hero en Canvas 2D: miles de triangulitos de contorno que forman una burbuja de chat,
 * se deshacen al bajar y se arman como cuatro círculos (el equipo). Sin brillo ni glow.
 * Pausa fuera de pantalla y con la pestaña oculta. Con "reducir movimiento" queda quieta (la burbuja).
 */
export function HeroConstellation({ pinned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const readTheme = (): "dark" | "light" => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

    let profile = profileFor(window.innerWidth);
    const make = () =>
      buildCloud({
        count: profile.count,
        sample: profile.sample,
        side: profile.side,
        seed: 20260611,
        colorWeights: COLOR_WEIGHTS,
        levelWeights: LEVEL_WEIGHTS,
      });
    let cloud: Cloud = make();

    let theme = readTheme();
    let size = 0;
    let dpr = 1;
    let quality = 1;
    let target = 0; // avance que pide el scroll (0–1)
    let current = 0; // avance que se dibuja (suavizado)
    let asm = reduce ? 0 : 1; // 1 = dispersas, 0 = en su lugar (entrada)
    let entryStart = 0;
    let visible = true;
    let raf = 0;
    let lastDraw = 0;
    let lastFrame = 0;
    const frameTimes: number[] = [];
    const drift = pinned && !reduce;

    const resize = () => {
      const next = Math.max(1, Math.round(Math.min(host.clientWidth, host.clientHeight || host.clientWidth)));
      dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
      size = next;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, size, size);
      const m = clamp01((current - 0.1) / 0.8);
      const half = size / 2;
      const scale = half * FIT;
      const colors = PALETTE[theme];
      const levels = LEVELS[theme];
      const L = levels.length;
      const entry = asm * 1.4;
      const spread = profile.spread;
      const tm = now * 0.0006;
      const amp = drift ? 1.2 : 0;
      const { ax, ay, bx, by, sx, sy, d, ph, tri, groupStart } = cloud;
      const G = groupStart.length - 1;
      ctx.lineWidth = (dpr >= 2 ? 1.25 : 1) + (theme === "light" ? 0.2 : 0);
      for (let g = 0; g < G; g++) {
        const s = groupStart[g];
        const e = s + Math.floor((groupStart[g + 1] - s) * quality);
        if (e <= s) continue;
        ctx.strokeStyle = colors[(g / L) | 0];
        ctx.globalAlpha = levels[g % L];
        ctx.beginPath();
        for (let i = s; i < e; i++) {
          const t = clamp01((m - d[i] * 0.35) / 0.65);
          const k = t * t * (3 - 2 * t);
          const wob = 4 * k * (1 - k) * spread + entry;
          let x = half + (ax[i] + (bx[i] - ax[i]) * k + sx[i] * wob) * scale;
          let y = half + (ay[i] + (by[i] - ay[i]) * k + sy[i] * wob) * scale;
          if (amp) {
            x += Math.sin(tm + ph[i]) * amp;
            y += Math.cos(tm * 0.8 + ph[i]) * amp;
          }
          const o = i * 6;
          ctx.moveTo(x + tri[o], y + tri[o + 1]);
          ctx.lineTo(x + tri[o + 2], y + tri[o + 3]);
          ctx.lineTo(x + tri[o + 4], y + tri[o + 5]);
          ctx.closePath();
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      lastDraw = now;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (!entryStart && asm > 0) entryStart = now;
      if (entryStart && asm > 0) {
        const t = clamp01((now - entryStart) / ENTRY_MS);
        asm = t >= 1 ? 0 : Math.pow(2, -10 * t); // 1 - ease-out exponencial
      }
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0005) current = target;
      const animating = asm > 0 || current !== target;

      if (!animating && drift && now - lastDraw < 33) {
        raf = requestAnimationFrame(frame);
        return;
      }
      draw(now);

      if (animating) {
        // Calidad adaptativa: si el promedio de 30 cuadros pasa de 20 ms, ×0.7 (piso 800); nunca sube.
        if (lastFrame && now - lastFrame < 100) frameTimes.push(now - lastFrame);
        lastFrame = now;
        if (frameTimes.length >= 30) {
          const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          frameTimes.length = 0;
          if (avg > 20 && cloud.n * quality > 800) quality = Math.max(quality * 0.7, 800 / cloud.n);
        }
      } else {
        lastFrame = 0;
      }
      if (animating || drift) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (reduce) {
        draw(performance.now());
        return;
      }
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    resize();
    const fadeIn = requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    // El avance sale de ScrollTrigger (scrub): fijo en computadora, siguiendo la figura en celular.
    let trigger: ScrollTrigger | undefined;
    if (!reduce) {
      const section = host.closest<HTMLElement>("[data-hero-scroll]");
      const usePin = pinned && !!section;
      trigger = ScrollTrigger.create({
        trigger: usePin ? section : host,
        start: usePin ? "top top" : "top 78%",
        end: usePin ? "bottom bottom" : "center 42%",
        scrub: true,
        onUpdate: (self) => {
          target = self.progress;
          kick();
        },
      });
      target = current = trigger.progress;
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) kick();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      const next = profileFor(window.innerWidth);
      if (next.count !== profile.count || next.sample !== profile.sample) {
        profile = next;
        cloud = make();
      }
      resize();
      kick();
      if (!raf) draw(performance.now());
    });
    ro.observe(host);

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else kick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const themeObserver = new MutationObserver(() => {
      theme = readTheme();
      if (!raf) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    draw(performance.now());
    kick();

    return () => {
      cancelAnimationFrame(fadeIn);
      if (raf) cancelAnimationFrame(raf);
      trigger?.kill();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pinned]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-full w-full opacity-0 transition-opacity duration-[600ms] ease-out"
    />
  );
}
