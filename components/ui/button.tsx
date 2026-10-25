import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";
import { Icon } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";
export type ButtonState = "idle" | "loading" | "success";

// Oscuro (Dala): 14px peso 600 MAYÚSCULAS, radio 24px. Claro (Apple): píldora, 17px peso 400.
const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control " +
  "font-semibold uppercase tracking-[0.025em] light:font-normal light:normal-case light:tracking-[-0.022em] " +
  "transition-[background-color,border-color,color,transform,opacity] duration-200 ease-out " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand";

const variants: Record<ButtonVariant, string> = {
  // El botón principal de la pantalla: violeta en oscuro, azul en claro. Uno por vista.
  primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-press",
  // Oscuro: botón fantasma (sin caja, solo texto). Claro: píldora con contorno #86868b.
  secondary:
    "border border-transparent bg-transparent text-ink-3 hover:text-ink active:text-ink-2 " +
    "light:border-line-strong light:text-ink light:hover:bg-ink/[0.04] light:active:bg-ink/[0.08]",
  ghost: "bg-transparent text-ink-3 hover:text-ink active:text-ink-2 light:text-ink light:hover:bg-ink/[0.05]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-[0.8125rem] light:text-[0.875rem]",
  lg: "h-[45px] px-[18px] text-[0.875rem] light:h-11 light:px-[22px] light:text-[1.0625rem]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** loading: muestra spinner y bloquea; success: palomita. */
  state?: ButtonState;
  loadingLabel?: string;
  successLabel?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", state = "idle", loadingLabel, successLabel, className, children, disabled, ...rest },
  ref,
) {
  const busy = state === "loading";
  return (
    <button
      ref={ref}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {state === "loading" ? (
        <>
          <Spinner />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : state === "success" ? (
        <>
          <Icon name="check" size={18} strokeWidth={2} />
          <span>{successLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

/** Enlace con forma de botón; navega con transición de página. */
export function ButtonLink({ href, variant = "primary", size = "md", className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
