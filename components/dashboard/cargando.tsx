import { Spinner } from "@/components/ui/spinner";
import { PageFrame } from "./page-frame";

/** Pantalla de espera dentro del marco, mientras llegan los datos reales. */
export function Cargando() {
  return (
    <PageFrame>
      <p role="status" className="flex items-center gap-3 text-[1.0625rem] text-app-fg-2">
        <Spinner size={18} />
        Cargando tu panel…
      </p>
    </PageFrame>
  );
}
