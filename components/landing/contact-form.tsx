"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldShell, Input, Textarea, isEmail } from "@/components/ui/field";
import { CONTACT } from "./content";
import { FormMessage } from "./form-message";
import { postJson } from "./post-json";

type Status = "idle" | "sending" | "ok" | "campos" | "invalid" | "error" | "unconfigured";

/** Formulario de contacto: POST /api/contacto { nombre, email, mensaje }. Todos los estados tienen texto. */
export function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    mensaje: useRef<HTMLTextAreaElement>(null),
  };

  const busy = status === "sending";
  const done = status === "ok";
  const lock = busy || done;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (lock) return;
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setStatus("campos");
      (!nombre.trim() ? refs.nombre : !email.trim() ? refs.email : refs.mensaje).current?.focus();
      return;
    }
    if (!isEmail(email)) {
      setStatus("invalid");
      refs.email.current?.focus();
      return;
    }
    setStatus("sending");
    const res = await postJson("/api/contacto", { nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim() });
    if (res.kind === "network") return setStatus("error");
    if (res.status === 200 && res.data.ok) return setStatus("ok");
    if (res.status === 400) return setStatus(res.data.error === "correo_invalido" ? "invalid" : "campos");
    if (res.status === 503) return setStatus("unconfigured");
    setStatus("error");
  }

  function again() {
    setNombre("");
    setEmail("");
    setMensaje("");
    setStatus("idle");
    refs.nombre.current?.focus();
  }

  const clear = () => {
    if (status === "campos" || status === "invalid" || status === "error") setStatus("idle");
  };
  const nameBad = status === "campos" && !nombre.trim();
  const emailBad = (status === "campos" && !email.trim()) || status === "invalid";
  const msgBad = status === "campos" && !mensaje.trim();

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-label="Contacto">
      <FieldShell label={CONTACT.name.label}>
        {({ id }) => (
          <Input
            id={id}
            ref={refs.nombre}
            name="nombre"
            autoComplete="name"
            inputSize="lg"
            placeholder={CONTACT.name.placeholder}
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              clear();
            }}
            status={nameBad ? "error" : "idle"}
            disabled={lock}
          />
        )}
      </FieldShell>

      <FieldShell label={CONTACT.email.label}>
        {({ id }) => (
          <Input
            id={id}
            ref={refs.email}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            inputSize="lg"
            placeholder={CONTACT.email.placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear();
            }}
            status={emailBad ? "error" : "idle"}
            disabled={lock}
          />
        )}
      </FieldShell>

      <FieldShell label={CONTACT.message.label}>
        {({ id }) => (
          <Textarea
            id={id}
            ref={refs.mensaje}
            name="mensaje"
            rows={5}
            placeholder={CONTACT.message.placeholder}
            value={mensaje}
            onChange={(e) => {
              setMensaje(e.target.value);
              clear();
            }}
            status={msgBad ? "error" : "idle"}
            className="light:rounded-[24px]"
            disabled={lock}
          />
        )}
      </FieldShell>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="lg"
            state={busy ? "loading" : done ? "success" : "idle"}
            loadingLabel={CONTACT.sendingShort}
            successLabel={CONTACT.doneShort}
          >
            {CONTACT.button}
          </Button>
          {done && (
            <Button type="button" variant="secondary" size="lg" onClick={again}>
              {CONTACT.again}
            </Button>
          )}
        </div>
        <div aria-live="polite" className="min-h-[1.5rem]">
          {busy && <FormMessage tone="info">{CONTACT.sending}</FormMessage>}
          {status === "ok" && <FormMessage tone="success">{CONTACT.messages.ok}</FormMessage>}
          {status === "campos" && <FormMessage tone="error">{CONTACT.messages.campos}</FormMessage>}
          {status === "invalid" && <FormMessage tone="error">{CONTACT.messages.invalid}</FormMessage>}
          {status === "error" && <FormMessage tone="error">{CONTACT.messages.error}</FormMessage>}
          {status === "unconfigured" && <FormMessage tone="info">{CONTACT.messages.unconfigured}</FormMessage>}
        </div>
      </div>
    </form>
  );
}
