"use client";

import { Sheet } from "@/components/ui/sheet";
import { ActivityRow } from "./activity-row";
import { useTablero } from "./context";
import { hrefRevisar } from "./revisar";

/** Hoja con lo que espera a la persona: visto buenos y casos que necesitan a una persona. */
export function AvisosSheet({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const t = useTablero();
  return (
    <Sheet open={abierto} onClose={onCerrar} title="Avisos" side="right">
      <h2 className="t-h3 mt-2">Avisos</h2>
      {t.avisos.length === 0 ? (
        <p className="t-body mt-4 text-app-fg-2">
          No tienes avisos por ahora. Cuando un agente necesite tu visto bueno, lo verás aquí.
        </p>
      ) : (
        <ul className="mt-4 light:divide-y light:divide-app-line">
          {t.avisos.map((fila) => (
            <ActivityRow
              key={fila.id}
              fila={fila}
              compacta
              href={hrefRevisar(t.rutas, t.conversaciones, fila)}
              onNavigate={onCerrar}
            />
          ))}
        </ul>
      )}
    </Sheet>
  );
}
