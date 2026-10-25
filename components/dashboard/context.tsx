"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { rutasDe, type Rutas } from "./rutas";
import type { ShellData } from "./types";

type Tablero = ShellData & { rutas: Rutas };

const Contexto = createContext<Tablero | null>(null);

/** Reparte los datos del panel a la barra, el lateral y los componentes de cada página. */
export function TableroProvider({ data, children }: { data: ShellData; children: ReactNode }) {
  const valor = useMemo(() => ({ ...data, rutas: rutasDe(data.base) }), [data]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTablero(): Tablero {
  const v = useContext(Contexto);
  if (!v) throw new Error("useTablero debe usarse dentro de TableroShell");
  return v;
}
