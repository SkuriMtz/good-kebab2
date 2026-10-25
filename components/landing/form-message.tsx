import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info";

/** Mensaje de un formulario: alert para errores, status para lo demás (el lector de pantalla lo anuncia). */
export function FormMessage({ id, tone, children }: { id?: string; tone: Tone; children: ReactNode }) {
  return (
    <p
      id={id}
      role={tone === "error" ? "alert" : "status"}
      className={cn("t-small", tone === "error" ? "text-danger" : tone === "success" ? "text-success" : "text-ink-2 light:text-ink-3")}
    >
      {children}
    </p>
  );
}
