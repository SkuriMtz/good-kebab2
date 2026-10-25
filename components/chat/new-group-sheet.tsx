"use client";

import { useEffect, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { AGENTS, type AgentId } from "@/lib/agents";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Button } from "@/components/ui/button";
import { FieldShell, Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onClose: () => void;
  allowed: AgentId[];
  /** Devuelve un mensaje de error, o null si salió bien. */
  onCreate: (nombre: string, agentes: AgentId[]) => Promise<string | null>;
};

/** Crear un grupo: un nombre y al menos dos agentes. Se pasan el trabajo en el orden en que los eliges. */
export function NewGroupSheet({ open, onClose, allowed, onCreate }: Props) {
  const [nombre, setNombre] = useState("");
  const [sel, setSel] = useState<AgentId[]>([]);
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<{ campo: "nombre" | "agentes" | "general"; texto: string } | null>(null);

  useEffect(() => {
    if (open) {
      setNombre("");
      setSel([]);
      setState("idle");
      setError(null);
    }
  }, [open]);

  const toggle = (id: AgentId) => {
    setError(null);
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    const limpio = nombre.trim();
    if (!limpio) return setError({ campo: "nombre", texto: "Ponle un nombre al grupo." });
    if (sel.length < 2) return setError({ campo: "agentes", texto: "Elige al menos dos agentes." });
    setState("loading");
    const fallo = await onCreate(limpio.slice(0, 40), sel);
    if (fallo) {
      setState("idle");
      setError({ campo: "general", texto: fallo });
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nuevo grupo" side="auto">
      <form onSubmit={submit} noValidate className="flex flex-col gap-7 pt-4">
        <div>
          <h2 className="t-h3">Nuevo grupo</h2>
          <p className="mt-2 text-[1rem] leading-relaxed text-chat-fg-2">
            Un grupo junta a varios agentes. Se pasan el trabajo en el orden en que los elijas.
          </p>
        </div>

        <FieldShell label="Nombre del grupo" status={error?.campo === "nombre" ? "error" : "idle"} message={error?.campo === "nombre" ? error.texto : undefined}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              inputSize="lg"
              placeholder="Por ejemplo, Recepción"
              maxLength={40}
              value={nombre}
              status={error?.campo === "nombre" ? "error" : "idle"}
              onChange={(e) => {
                setNombre(e.target.value);
                setError(null);
              }}
              data-autofocus
            />
          )}
        </FieldShell>

        <fieldset className="min-w-0">
          <legend className="t-small mb-3 font-medium text-ink-3 light:text-ink">Agentes</legend>
          <div className="flex flex-col gap-1">
            {AGENTS.map((a) => {
              const locked = !allowed.includes(a.id);
              const pos = sel.indexOf(a.id);
              const on = pos >= 0;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-disabled={locked || undefined}
                  onClick={() => !locked && toggle(a.id)}
                  className={cn(
                    "flex min-h-[64px] items-center gap-3.5 rounded-[20px] px-3 py-2 text-left transition-colors duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand",
                    locked ? "cursor-not-allowed opacity-60" : "light:hover:bg-chat-panel",
                    on ? "text-chat-fg light:bg-chat-panel" : "text-ink-2 light:text-chat-fg",
                  )}
                >
                  <AgentBlob agent={a.id} size={42} className={locked ? "opacity-50 grayscale" : undefined} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[1.125rem] leading-snug", on ? "font-semibold" : "font-normal")}>{a.name}</span>
                    <span className="block text-[0.875rem] font-normal text-chat-fg-2">{locked ? "No viene en tu plan" : a.area}</span>
                  </span>
                  {locked ? (
                    <Icon name="lock" size={18} className="shrink-0 text-chat-fg-2" />
                  ) : on ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[1.0625rem] font-semibold t-num" aria-label={`Lugar ${pos + 1}`}>
                      {pos + 1}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {error?.campo === "agentes" && (
            <p role="alert" className="mt-3 px-3 text-sm text-danger">
              {error.texto}
            </p>
          )}
        </fieldset>

        {error?.campo === "general" && (
          <p role="alert" className="text-sm text-danger">
            {error.texto}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button type="submit" size="lg" state={state === "loading" ? "loading" : "idle"} loadingLabel="Creando el grupo…" className="sm:flex-1">
            Crear grupo
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={onClose} className="sm:flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
