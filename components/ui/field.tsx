"use client";

import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FieldStatus = "idle" | "error" | "success";

const control =
  // Oscuro: relleno blanco al 7% sin borde (radio 24px). Claro: blanco con borde #86868b (radio 980px).
  "w-full rounded-field border bg-field text-ink placeholder:text-ink-3 " +
  "transition-[border-color,background-color] duration-200 ease-out " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
  "disabled:opacity-60";

const statusBorder: Record<FieldStatus, string> = {
  idle: "border-field-line light:hover:border-ink",
  error: "border-danger",
  success: "border-success/70",
};

type FieldShellProps = {
  label: string;
  /** Oculta la etiqueta visualmente (sigue para lectores de pantalla). */
  hideLabel?: boolean;
  hint?: ReactNode;
  message?: ReactNode;
  status?: FieldStatus;
  className?: string;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
};

/** Etiqueta + control + mensaje, conectados con aria-describedby. */
export function FieldShell({ label, hideLabel, hint, message, status = "idle", className, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const msgId = message ? `${id}-msg` : undefined;
  const describedBy = [hintId, msgId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "t-small font-medium text-ink-3 light:text-ink"}>
        {label}
      </label>
      {children({ id, describedBy })}
      {hint && (
        <p id={hintId} className="text-sm text-ink-3">
          {hint}
        </p>
      )}
      {message && (
        <p
          id={msgId}
          role={status === "error" ? "alert" : "status"}
          className={cn("text-sm", status === "error" ? "text-danger" : status === "success" ? "text-success" : "text-ink-2")}
        >
          {message}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { status?: FieldStatus; inputSize?: "md" | "lg" };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { status = "idle", inputSize = "md", className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={status === "error" || undefined}
      className={cn(control, statusBorder[status], inputSize === "lg" ? "h-[45px] px-5 text-base light:h-11" : "h-10 px-4 text-[0.9375rem]", className)}
      {...rest}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { status?: FieldStatus };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { status = "idle", className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={status === "error" || undefined}
      className={cn(control, statusBorder[status], "min-h-[140px] resize-y rounded-[24px] px-5 py-4 text-[0.9375rem] leading-relaxed", className)}
      {...rest}
    />
  );
});

/** Validación sencilla de correo para la interfaz (el servidor vuelve a validar). */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
