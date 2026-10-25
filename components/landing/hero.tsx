"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { HERO } from "./content";
import { WaitlistForm } from "./waitlist-form";

// La figura se carga después del primer pintado: no toca el LCP y no existe en el servidor.
const HeroConstellation = dynamic(() => import("./hero-constellation").then((m) => m.HeroConstellation), {
  ssr: false,
});

/** Computadora con altura suficiente y sin "reducir movimiento": la portada se queda fija mientras cambia la figura. */
const PIN_QUERY = "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

/**
 * Portada en dos columnas asimétricas: texto a la izquierda, figura a la derecha.
 * En computadora la sección mide 100svh + 70vh y el escenario queda fijo (sticky) ese tramo; el scroll
 * de ese tramo deshace la burbuja y arma el equipo. En celular la figura va debajo del formulario.
 */
export function Hero() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <Reveal
      as="section"
      id="inicio"
      aria-labelledby="hero-title"
      data-hero-scroll
      className="relative"
      style={pinned ? { height: "calc(100svh + 70vh)" } : undefined}
    >
      <div className={pinned ? "sticky top-0 h-svh" : undefined}>
        <div className="page-w grid h-full items-center gap-10 pb-16 pt-[calc(var(--header-h)+40px)] lg:grid-cols-12 lg:gap-8 lg:pb-12 lg:pt-[calc(var(--header-h)+24px)]">
          <div className="flex flex-col items-start lg:col-span-6">
            <p data-r className="t-label">
              {HERO.label}
            </p>
            <h1
              data-r
              id="hero-title"
              className="t-hero mt-6 light:lg:relative light:lg:z-10 light:lg:w-[calc(100%+12vw)] light:lg:max-w-none"
            >
              {HERO.title}
            </h1>
            <p data-r className="t-lead mt-7 max-w-[34rem] text-ink light:text-ink-3">
              {HERO.text}
            </p>
            <div data-r className="mt-9 w-full max-w-[34rem]">
              <WaitlistForm origen="portada" />
              <a
                href="#demo"
                className="t-nav mt-5 inline-flex min-h-11 items-center gap-2 rounded-md text-ink-3 transition-colors duration-200 hover:text-ink active:text-ink-2 light:text-link light:hover:underline"
              >
                {HERO.demoLink}
                <Icon name="arrowRight" size={16} />
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6 lg:justify-end">
            <div className="relative aspect-square w-full max-w-[360px] lg:w-[min(100%,600px,calc(100svh_-_var(--header-h)_-_72px))] lg:max-w-none">
              <HeroConstellation pinned={pinned} />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
