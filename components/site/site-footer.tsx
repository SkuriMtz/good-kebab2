import { Link } from "next-view-transitions";
import { LogoMark } from "@/components/brand/logo";

const LINKS = [
  { label: "Agentes", href: "/#agentes" },
  { label: "Precios", href: "/#precios" },
  { label: "Pruébalo", href: "/pruebalo" },
  { label: "Contacto", href: "/contacto" },
  { label: "Entrar", href: "/entrar" },
];

/** Cierre de la página: el nombre regresa a todo lo ancho. */
export function SiteFooter() {
  return (
    <footer className="relative mt-section light:bg-canvas-alt">
      <div className="page-w pb-10 pt-16 lg:pt-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="t-lead max-w-[34ch] text-ink">Agentes de IA para negocios que atienden personas.</p>
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="t-nav text-ink-3 transition-colors duration-200 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex items-end gap-[2vw] lg:mt-24" aria-hidden="true">
          <LogoMark size={0} className="h-[13vw] w-[13vw] max-h-[180px] max-w-[180px]" />
          <span className="select-none text-[clamp(4.5rem,19vw,17rem)] font-normal leading-[0.8] tracking-[-0.06em] text-ink light:font-semibold light:tracking-[-0.045em]">
            atendel
          </span>
        </div>

        <div className="t-small mt-12 flex flex-col gap-2 pt-6 text-ink-3 sm:flex-row sm:justify-between light:border-t light:border-line light:text-xs">
          <p>© 2026 Atendel</p>
          <p>Los nombres, horarios y precios de Estudio Luna son datos de ejemplo.</p>
        </div>
      </div>
    </footer>
  );
}
