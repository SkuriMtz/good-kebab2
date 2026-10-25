"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { buttonClasses } from "@/components/ui/button";

type NavItem = { label: string; href: string; hash?: string };

const NAV: NavItem[] = [
  { label: "Agentes", href: "/#agentes", hash: "#agentes" },
  { label: "Precios", href: "/#precios", hash: "#precios" },
  { label: "Preguntas", href: "/#preguntas", hash: "#preguntas" },
  { label: "Pruébalo", href: "/pruebalo" },
  { label: "Contacto", href: "/contacto" },
];

/** En la portada, las anclas son saltos dentro de la página (sin transición). */
function NavLink({ item, onHome, className, onClick }: { item: NavItem; onHome: boolean; className: string; onClick?: () => void }) {
  if (item.hash && onHome) {
    return (
      <a href={item.hash} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.label}
    </Link>
  );
}

/**
 * Oscuro (Dala): transparente sobre negro, enlaces 14px MAYÚSCULAS en gris ceniza.
 * Claro (Apple): barra blanca de 48px, enlaces 12px; al bajar, #fafafc translúcido con línea #e6e6e8.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const linkClass = (href: string) =>
    cn(
      "t-nav rounded-md px-3 py-2 transition-colors duration-200",
      pathname === href ? "text-ink" : "text-ink-3 hover:text-ink light:text-ink/80 light:hover:text-ink",
    );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 [view-transition-name:site-header]",
        "border-b border-transparent transition-[background-color,border-color] duration-300 ease-out",
        scrolled && "bg-canvas/90 light:border-[#e6e6e8] light:bg-[#fafafc]/80 light:backdrop-blur-[20px]",
      )}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-10 focus:rounded-control focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <div className="page-w flex h-header items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} onHome={onHome} className={linkClass(item.href)} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/entrar"
            className={buttonClasses(
              "secondary",
              "md",
              "hidden h-9 px-3 sm:inline-flex light:h-7 light:px-3 light:text-xs",
            )}
          >
            Entrar
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-control text-ink transition-colors duration-200 hover:bg-ink/[0.06] active:bg-ink/[0.1] lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Menú principal"
        side="right"
        className="max-w-none md:max-w-[440px] light:bg-[#fafafc]"
      >
        <nav aria-label="Menú principal" className="flex flex-col pt-6">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              onHome={onHome}
              onClick={() => setOpen(false)}
              className="sheet-item py-4 text-[2.25rem] font-normal leading-none tracking-[-0.04em] text-ink transition-colors duration-200 hover:text-ink-3 light:border-b light:border-[#e6e6e8] light:text-[1.75rem] light:font-semibold light:tracking-[-0.015em]"
            />
          ))}
        </nav>
        <div className="mt-10 flex items-center gap-3">
          <Link href="/entrar" onClick={() => setOpen(false)} className={buttonClasses("secondary", "lg", "flex-1 light:flex-1")}>
            Entrar
          </Link>
          <ThemeToggle withLabel className="h-11" />
        </div>
      </Sheet>
    </header>
  );
}
