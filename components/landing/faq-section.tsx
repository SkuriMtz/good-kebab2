"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";
import { FAQ } from "./content";

/** Más / menos sin giros: la barra vertical solo cambia de opacidad. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ opacity: open ? 0 : 1, transition: "opacity 300ms var(--ease-out)" }}
      />
    </svg>
  );
}

/** Acordeón accesible: botón con aria-expanded + región. Flechas, Inicio y Fin mueven entre preguntas. */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = FAQ.items.length - 1;
    const to = e.key === "ArrowDown" ? (i === last ? 0 : i + 1) : e.key === "ArrowUp" ? (i === 0 ? last : i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (to < 0) return;
    e.preventDefault();
    refs.current[to]?.focus();
  };

  return (
    <section id="preguntas" aria-labelledby="preguntas-title" className="page-w py-section">
      <Reveal className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+56px)]">
            <p data-r className="t-label">
              {FAQ.label}
            </p>
            <h2 data-r id="preguntas-title" className="t-title-lg mt-5">
              {FAQ.title}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-7">
          {FAQ.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `${base}-q${i}`;
            const panelId = `${base}-a${i}`;
            return (
              <div
                key={item.q}
                data-r
                className="light:border-t light:border-line light:last:border-b"
              >
                <h3>
                  <button
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={cn(
                      "group flex w-full items-center justify-between gap-6 rounded-control py-6 text-left transition-colors duration-200 lg:py-7",
                      "text-[1.375rem] leading-[1.2] tracking-[-0.03em] [font-weight:var(--w-display)] sm:text-[1.625rem] lg:text-[1.875rem]",
                      "light:tracking-[-0.015em] light:text-[1.25rem] sm:light:text-[1.375rem] lg:light:text-[1.5rem]",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand",
                      isOpen ? "text-ink" : "text-ink-2 hover:text-ink light:text-ink",
                    )}
                  >
                    <span>{item.q}</span>
                    <span className="text-ink-3 transition-colors duration-200 group-hover:text-ink">
                      <PlusMinus open={isOpen} />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="grid"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? "visible" : "hidden",
                    transition: isOpen
                      ? "grid-template-rows 480ms var(--ease-out), opacity 380ms var(--ease-out) 80ms, visibility 0s"
                      : "grid-template-rows 220ms var(--ease-in), opacity 160ms var(--ease-in), visibility 0s linear 220ms",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="t-lead max-w-[52ch] pb-8 text-ink">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
