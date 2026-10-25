"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { AvisosSheet } from "./avisos";
import { TableroProvider } from "./context";
import { SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";
import type { ShellData } from "./types";

/**
 * Marco del panel: barra fija arriba, lateral fijo a la izquierda (en celular, una
 * hoja que se abre con el menú) y, en medio, el contenido de cada página.
 * Es el mismo para /pruebalo (datos de ejemplo) y /panel (datos reales).
 * La barra y el lateral llevan nombre de transición: no se mueven al cambiar de página.
 */
export function TableroShell({ data, children }: { data: ShellData; children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [avisos, setAvisos] = useState(false);

  useEffect(() => {
    setMenu(false);
    setAvisos(false);
  }, [pathname]);

  return (
    <TableroProvider data={data}>
      <Topbar
        onMenu={() => setMenu(true)}
        onAvisos={() => setAvisos(true)}
        menuAbierto={menu}
        avisosAbiertos={avisos}
      />

      <aside
        aria-label="Lateral"
        className="fixed bottom-0 left-0 top-header z-30 hidden w-[272px] bg-app-bar [view-transition-name:app-side] lg:flex lg:flex-col light:border-r light:border-app-line"
      >
        <SidebarContent columna />
      </aside>

      <Sheet
        open={menu}
        onClose={() => setMenu(false)}
        title="Menú"
        side="right"
        className="left-0 !max-w-[88vw] sm:!max-w-[360px] light:!border-l-0 light:border-r light:border-app-line"
      >
        <div className="-mx-3 min-h-[calc(100dvh-7rem)]">
          <SidebarContent onNavigate={() => setMenu(false)} />
        </div>
      </Sheet>

      <AvisosSheet abierto={avisos} onCerrar={() => setAvisos(false)} />

      <div className="min-h-[100dvh] bg-app-bg text-app-fg lg:pl-[272px]">
        <main id="contenido" tabIndex={-1} className="pt-header outline-none">
          {children}
        </main>
      </div>
    </TableroProvider>
  );
}
