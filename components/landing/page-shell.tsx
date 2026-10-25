import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

type Props = {
  title: string;
  text: string;
  /** Algo bajo el texto, en la columna izquierda (personajes, enlaces). */
  aside?: ReactNode;
  /** Formulario: columna derecha. En claro va en una tarjeta blanca de 28px sobre la banda. */
  children: ReactNode;
};

/**
 * Composición de las páginas de formulario (contacto, entrar): título enorme y texto a la izquierda,
 * el formulario flotando a la derecha. En claro, banda #f5f5f7 con el formulario en una tarjeta blanca.
 */
export function PageShell({ title, text, aside, children }: Props) {
  return (
    <section aria-labelledby="page-title" className="band min-h-svh light:-mb-section">
      <Reveal className="page-w grid items-start gap-14 pb-section pt-[calc(var(--header-h)+56px)] lg:grid-cols-12 lg:gap-8 lg:pt-[calc(var(--header-h)+112px)]">
        <div className="lg:col-span-6">
          <h1 data-r id="page-title" className="t-hero">
            {title}
          </h1>
          <p data-r className="t-lead mt-7 max-w-[30rem] text-ink">
            {text}
          </p>
          {aside && (
            <div data-r className="mt-12 lg:mt-20">
              {aside}
            </div>
          )}
        </div>
        <div data-r className="card lg:col-span-5 lg:col-start-8 lg:mt-3">
          {children}
        </div>
      </Reveal>
    </section>
  );
}
