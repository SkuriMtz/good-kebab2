"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "./use-theme";

/** Botón de ícono: sol en oscuro (pasa a claro), luna en claro (pasa a oscuro). */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-control text-ink-2 transition-[background-color,color,transform] duration-200 ease-out",
        "hover:bg-ink/[0.06] hover:text-ink active:translate-y-px active:bg-ink/[0.1]",
        withLabel ? "px-3" : "w-10",
        className,
      )}
    >
      <Icon name="sun" className="light:hidden" />
      <Icon name="moon" className="hidden light:block" />
      {withLabel && (
        <span className="text-sm">
          <span className="light:hidden">Claro</span>
          <span className="hidden light:inline">Oscuro</span>
        </span>
      )}
    </button>
  );
}
