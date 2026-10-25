import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ParticleField } from "@/components/site/particle-field";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { NOT_FOUND } from "@/components/landing/content";
import { LookAround } from "@/components/landing/look-around";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

/**
 * 404 con personalidad. Está fuera de app/(site), así que trae su propia barra, fondo y pie.
 * Los cuatro personajes miran a los lados, buscando la página.
 */
export default function NotFound() {
  return (
    <>
      <SmoothScroll />
      <ParticleField />
      <SiteHeader />
      <div id="contenido" className="relative overflow-x-clip">
        <main>
          <section aria-labelledby="nf-title" className="band light:-mb-section">
            <Reveal className="page-w grid min-h-svh items-center gap-14 pb-section pt-[calc(var(--header-h)+48px)] lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <p data-r className="t-label">
                  404
                </p>
                <h1 data-r id="nf-title" className="t-hero mt-6">
                  {NOT_FOUND.title}
                </h1>
                <p data-r className="t-lead mt-7 max-w-[32rem] text-ink">
                  {NOT_FOUND.text}
                </p>
                <div data-r className="mt-10 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/" size="lg">
                    {NOT_FOUND.home}
                  </ButtonLink>
                  <ButtonLink href="/pruebalo" variant="secondary" size="lg">
                    {NOT_FOUND.tryIt}
                  </ButtonLink>
                </div>
              </div>
              <div data-r className="lg:col-span-5">
                <LookAround />
              </div>
            </Reveal>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
