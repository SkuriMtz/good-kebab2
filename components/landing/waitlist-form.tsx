"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { FieldShell, Input, isEmail } from "@/components/ui/field";
import { WAITLIST } from "./content";
import { postJson } from "./post-json";

type Status = "idle" | "sending" | "ok" | "already" | "invalid" | "error" | "unconfigured";
type PlanValue = "" | "one" | "max";

export const PLAN_EVENT = "atendel:plan";

/** Elige el plan de la lista final desde otra parte de la página (los botones de One y Max). */
export function choosePlan(plan: "one" | "max") {
  window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail: plan }));
}

type Props = {
  origen: "portada" | "lista";
  /** Muestra la elección del plan de interés (solo en la lista final). */
  withPlan?: boolean;
  className?: string;
};

/**
 * Formulario de la lista de espera: se usa en la portada y en el cierre.
 * POST /api/lista con { email, plan?, origen }. Todos los estados tienen texto y
 * viven en una región con aria-live; el campo y el botón cambian con ellos.
 */
export function WaitlistForm({ origen, withPlan = false, className }: Props) {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanValue>("");
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const msgId = useId();

  useEffect(() => {
    if (!withPlan) return;
    const onPlan = (e: Event) => {
      const next = (e as CustomEvent<PlanValue>).detail;
      if (next === "one" || next === "max") setPlan(next);
    };
    window.addEventListener(PLAN_EVENT, onPlan);
    return () => window.removeEventListener(PLAN_EVENT, onPlan);
  }, [withPlan]);

  const busy = status === "sending";
  const done = status === "ok" || status === "already";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy || done) return;
    if (!isEmail(email)) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }
    setStatus("sending");
    const body: { email: string; plan?: string; origen: string } = { email: email.trim(), origen };
    if (withPlan && plan) body.plan = plan;
    const res = await postJson("/api/lista", body);
    if (res.kind === "network") return setStatus("error");
    if (res.status === 200 && res.data.ok) return setStatus(res.data.yaEstaba ? "already" : "ok");
    if (res.status === 400) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }
    if (res.status === 503) return setStatus("unconfigured");
    setStatus("error");
  }

  const isError = status === "invalid" || status === "error";
  const message: React.ReactNode =
    status === "idle"
      ? null
      : status === "unconfigured" ? (
        <>
          La lista aún no recibe correos. Escríbenos desde{" "}
          <Link href="/contacto" className="text-link underline underline-offset-4 hover:no-underline">
            Contacto
          </Link>{" "}
          y te anotamos.
        </>
      ) : (
        WAITLIST.messages[status]
      );

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-5", className)} aria-label={origen === "portada" ? undefined : "Lista de espera"}>
      {withPlan && <PlanChoice value={plan} onChange={setPlan} disabled={busy || done} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <FieldShell label={WAITLIST.emailLabel} hideLabel className="sm:flex-1">
          {({ id }) => (
            <Input
              id={id}
              ref={inputRef}
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              inputSize="lg"
              placeholder={WAITLIST.placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "invalid" || status === "error") setStatus("idle");
              }}
              status={status === "invalid" ? "error" : done ? "success" : "idle"}
              aria-describedby={msgId}
              readOnly={done}
              disabled={busy}
            />
          )}
        </FieldShell>
        <Button
          type="submit"
          size="lg"
          className="sm:shrink-0"
          state={busy ? "loading" : done ? "success" : "idle"}
          loadingLabel={WAITLIST.sending}
          successLabel={WAITLIST.done}
        >
          {WAITLIST.button}
        </Button>
      </div>

      <div id={msgId} aria-live="polite" className="-mt-1 min-h-[1.5rem]">
        {busy ? (
          <p role="status" className="t-small text-ink-2">
            {WAITLIST.messages.sending}
          </p>
        ) : message ? (
          <p
            role={isError ? "alert" : "status"}
            className={cn("t-small", isError ? "text-danger" : done ? "text-success" : "text-ink-2")}
          >
            {message}
          </p>
        ) : (
          <p className="t-small text-ink-3">{WAITLIST.fine}</p>
        )}
      </div>
    </form>
  );
}

/** Elección del plan de interés: tres opciones, un radio accesible. */
function PlanChoice({ value, onChange, disabled }: { value: PlanValue; onChange: (v: PlanValue) => void; disabled?: boolean }) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="t-small mb-3 font-medium text-ink-3 light:text-ink">{WAITLIST.planLegend}</legend>
      <div className="flex flex-wrap gap-2">
        {WAITLIST.plans.map((opt) => (
          <label key={opt.label} className="relative">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-flex h-11 min-w-[88px] cursor-pointer select-none items-center justify-center rounded-field px-5 text-[0.9375rem]",
                "border border-transparent bg-field text-ink-2 transition-[background-color,color,border-color,transform] duration-200 ease-out",
                "hover:text-ink hover:bg-ink/[0.12] active:translate-y-px",
                "light:border-field-line light:bg-canvas light:hover:border-ink light:hover:bg-canvas",
                "peer-checked:bg-ink peer-checked:text-canvas peer-checked:hover:bg-ink peer-checked:hover:text-canvas",
                "light:peer-checked:border-ink light:peer-checked:bg-ink light:peer-checked:hover:bg-ink",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
                "peer-disabled:cursor-default peer-disabled:opacity-60",
              )}
            >
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
