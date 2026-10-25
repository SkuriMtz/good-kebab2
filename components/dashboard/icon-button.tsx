"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";

/**
 * Botón de solo ícono de la barra. Estados: reposo (gris), hover y presión
 * (relleno suave), abierto (aria-expanded) y foco visible (anillo global).
 * Mide 44px en celular y 40px en computadora.
 */
const clases =
  "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-app-fg-2 " +
  "transition-[background-color,color,transform] duration-200 ease-out " +
  "hover:bg-app-fg/[0.08] hover:text-app-fg active:translate-y-px active:bg-app-fg/[0.14] " +
  "aria-expanded:bg-app-fg/[0.08] aria-expanded:text-app-fg md:h-10 md:w-10";

type Base = { label: string; children: ReactNode; className?: string };

export const IconButton = forwardRef<
  HTMLButtonElement,
  Base & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">
>(function IconButton({ label, children, className, type = "button", ...rest }, ref) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cn(clases, className)} {...rest}>
      {children}
    </button>
  );
});

export function IconLink({ href, label, children, className }: Base & { href: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={cn(clases, className)}>
      {children}
    </Link>
  );
}
