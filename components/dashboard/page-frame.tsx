import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Ancho y márgenes del contenido de cada página del panel. */
export function PageFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1080px] px-5 pb-28 pt-8 sm:px-8 lg:px-12 lg:pt-12", className)}>
      {children}
    </div>
  );
}
