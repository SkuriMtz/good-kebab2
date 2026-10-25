import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ParticleField } from "@/components/site/particle-field";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/** Sitio público: barra y fondo fijos; solo el contenido cambia entre páginas. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <ParticleField />
      <SiteHeader />
      <div id="contenido" className="relative overflow-x-clip">
        <main>{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
