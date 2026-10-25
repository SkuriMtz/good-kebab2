"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldShell, Input, isEmail } from "@/components/ui/field";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { LOGIN } from "./content";
import { FormMessage } from "./form-message";

type Status = "idle" | "sending" | "sent" | "invalid" | "error" | "toofast" | "unconfigured";

const COOLDOWN = 60;

/**
 * Entrar sin contraseña: signInWithOtp manda un enlace al correo. Sin Supabase configurado
 * (getBrowserSupabase() = null) dice con claridad que las cuentas aún no abren y lleva a Pruébalo.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [sentTo, setSentTo] = useState("");
  const [wait, setWait] = useState(0);
  const [resent, setResent] = useState(false);
  const [expired, setExpired] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);

  // El callback manda aquí con ?error=enlace (enlace vencido) o ?error=no_configurado.
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "enlace") setExpired(true);
    if (err === "no_configurado") setStatus("unconfigured");
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  useEffect(() => {
    if (status === "sent") sentRef.current?.focus();
  }, [status]);

  async function send(to: string): Promise<Status> {
    const supabase = getBrowserSupabase();
    if (!supabase) return "unconfigured";
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: to,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/panel` },
      });
      if (!error) return "sent";
      return error.status === 429 || /rate limit|seconds/i.test(error.message) ? "toofast" : "error";
    } catch {
      return "error";
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const value = email.trim();
    if (!isEmail(value)) {
      setStatus("invalid");
      inputRef.current?.focus();
      return;
    }
    setExpired(false);
    setStatus("sending");
    const next = await send(value);
    if (next === "sent") {
      setSentTo(value);
      setWait(COOLDOWN);
      setResent(false);
    }
    setStatus(next);
  }

  async function resend() {
    if (wait > 0) return;
    setResent(false);
    const next = await send(sentTo);
    if (next === "sent") {
      setWait(COOLDOWN);
      setResent(true);
    } else {
      setStatus(next);
    }
  }

  function pickAnother() {
    setStatus("idle");
    setEmail("");
    setResent(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-6">
        <h2 ref={sentRef} tabIndex={-1} className="t-title outline-none">
          {LOGIN.sentTitle}
        </h2>
        <p className="t-lead text-ink" role="status">
          {LOGIN.sentBefore}
          <span className="[overflow-wrap:anywhere] font-normal text-ink">{sentTo}</span>
          {LOGIN.sentAfter}
        </p>
        {resent && <FormMessage tone="success">{LOGIN.resent}</FormMessage>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={pickAnother}>
            {LOGIN.other}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={resend} disabled={wait > 0}>
            {wait > 0 ? `${LOGIN.resend} (${wait} s)` : LOGIN.resend}
          </Button>
        </div>
      </div>
    );
  }

  const busy = status === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-label="Entrar">
      {expired && <FormMessage tone="error">{LOGIN.expired}</FormMessage>}

      <FieldShell label={LOGIN.email.label}>
        {({ id }) => (
          <Input
            id={id}
            ref={inputRef}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            inputSize="lg"
            placeholder={LOGIN.email.placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "invalid" || status === "error" || status === "toofast") setStatus("idle");
            }}
            status={status === "invalid" ? "error" : "idle"}
            disabled={busy}
          />
        )}
      </FieldShell>

      <div className="flex flex-col gap-4">
        <div>
          <Button type="submit" size="lg" state={busy ? "loading" : "idle"} loadingLabel={LOGIN.sendingShort}>
            {LOGIN.button}
          </Button>
        </div>
        <div aria-live="polite" className="min-h-[1.5rem]">
          {busy && <FormMessage tone="info">{LOGIN.sending}</FormMessage>}
          {status === "invalid" && <FormMessage tone="error">{LOGIN.invalid}</FormMessage>}
          {status === "error" && <FormMessage tone="error">{LOGIN.error}</FormMessage>}
          {status === "toofast" && <FormMessage tone="error">{LOGIN.tooFast}</FormMessage>}
          {status === "unconfigured" && (
            <div className="flex flex-col gap-2">
              <FormMessage tone="info">{LOGIN.unconfigured}</FormMessage>
              <p className="t-small text-ink-2 light:text-ink-3">{LOGIN.unconfiguredMore}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <ButtonLink href="/pruebalo" variant="secondary" size="lg">
          {LOGIN.tryIt}
        </ButtonLink>
      </div>
    </form>
  );
}
