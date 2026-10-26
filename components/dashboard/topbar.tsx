"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { AccountMenu } from "./account-menu";
import { useTablero } from "./context";
import { IconButton, IconLink } from "./icon-button";
import { hrefChat } from "./rutas";
import { Search } from "./search";

type Props = {
  onMenu: () => void;
  onAvisos: () => void;
  avisosAbiertos: boolean;
  menuAbierto: boolean;
};

/**
 * Barra fija. Va quieta durante las transiciones de página ([view-transition-name:app-top]).
 * Menú (celular) · logo · título · buscador · + conversación nueva · avisos · conversaciones · cuenta.
 */
export function Topbar({ onMenu, onAvisos, avisosAbiertos, menuAbierto }: Props) {
  const t = useTablero();
  const pathname = usePathname();
  const titulo = pathname.endsWith("/actividad") ? "Actividad" : "Inicio";
  const n = t.avisos.length;

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-header bg-app-bar [view-transition-name:app-top] light:border-b light:border-app-line">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-20 focus:rounded-control focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>

      <div className="relative flex h-full items-center gap-1 px-2 sm:px-3 lg:pl-0 lg:pr-5">
        <div className="flex shrink-0 items-center gap-1 lg:w-[272px] lg:pl-6">
          <IconButton
            label="Abrir menú"
            onClick={onMenu}
            aria-expanded={menuAbierto}
            aria-haspopup="dialog"
            className="lg:hidden"
          >
            <Icon name="menu" size={22} />
          </IconButton>
          <Logo href={t.demo ? t.rutas.sitio : t.rutas.inicio} />
        </div>

        <p className="ml-1 hidden shrink-0 text-[0.875rem] font-semibold uppercase tracking-[0.025em] text-app-fg-2 sm:block lg:ml-0 light:text-[1.1875rem] light:normal-case light:tracking-[0.012em] light:text-app-fg">
          {titulo}
        </p>

        <Search />

        {t.demo && titulo === "Actividad" && <span className="t-status ml-6 hidden shrink-0 xl:block">Datos de ejemplo</span>}

        <div className="flex shrink-0 items-center gap-0.5 md:ml-auto">
          <IconLink href={hrefChat(t.rutas, { nueva: "1" })} label="Nueva conversación">
            <Icon name="plus" size={22} />
          </IconLink>

          <IconButton
            label={n ? `Avisos, ${n} por revisar` : "Avisos"}
            onClick={onAvisos}
            aria-haspopup="dialog"
            aria-expanded={avisosAbiertos}
          >
            <Icon name="bell" size={21} />
            {n > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />}
          </IconButton>

          <IconLink href={hrefChat(t.rutas)} label="Conversaciones" className="max-md:hidden">
            <Icon name="chat" size={21} />
          </IconLink>

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
