"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "next-view-transitions";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { DEMO, DEMO_SCRIPT, DEMO_SUGGESTIONS, type DemoCard, type DemoMessage } from "./content";

/** Entrada de cada mensaje: opacidad y subida, una sola vez. */
function Appear({ children, className }: { children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ResultCard({ card }: { card: DemoCard }) {
  return (
    <div className="mt-4 flex items-start gap-4 light:rounded-[20px] light:bg-canvas-alt light:p-4">
      <span className="mt-0.5 text-ink-3 light:text-ink">
        <Icon name={card.kind === "cita" ? "calendar" : "bell"} size={22} />
      </span>
      <div className="min-w-0">
        <p className="t-status">{card.title}</p>
        {card.kind === "cita" ? (
          <>
            <p className="mt-1.5 text-[1.375rem] font-normal leading-tight tracking-[-0.02em] text-ink light:font-semibold">
              {card.lines[0]}
            </p>
            <p className="t-small mt-1 text-ink-3">{card.lines[1]}</p>
          </>
        ) : (
          <>
            <p className="t-body mt-1.5 text-ink">{card.text}</p>
            <p className="t-status mt-2">{card.status}</p>
          </>
        )}
      </div>
    </div>
  );
}

function ClientBubble({ msg }: { msg: DemoMessage }) {
  return (
    <Appear className="flex flex-col items-end gap-1.5">
      <p className="max-w-[88%] rounded-[24px] bg-field px-5 py-3 text-base leading-snug text-ink light:bg-canvas-alt sm:max-w-[80%]">
        {msg.text}
      </p>
      <span className="t-num px-2 text-xs text-ink-3">{msg.time}</span>
    </Appear>
  );
}

function LolaMessage({ msg }: { msg: DemoMessage }) {
  return (
    <Appear className="grid grid-cols-[auto_1fr] gap-x-3.5">
      <AgentBlob agent="lola" size={32} className="mt-0.5" />
      <div className="min-w-0">
        <p className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{DEMO.chatAgent}</span>
          <span className="t-num text-xs text-ink-3">{msg.time}</span>
        </p>
        <p className="t-body mt-1.5 text-ink">{msg.text}</p>
        {msg.note && <p className="t-small mt-2 text-ink-3">{msg.note}</p>}
        {msg.card && <ResultCard card={msg.card} />}
      </div>
    </Appear>
  );
}

function Typing() {
  return (
    <Appear className="grid grid-cols-[auto_1fr] items-center gap-x-3.5">
      <AgentBlob agent="lola" size={32} />
      <p className="flex items-center gap-2 text-sm text-ink-3" role="status">
        <span className="sr-only">Lola está escribiendo…</span>
        <span aria-hidden="true">{DEMO.typing.replace("…", "")}</span>
        <span aria-hidden="true" className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-ink-3"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
      </p>
    </Appear>
  );
}

/**
 * Chat de demostración con guion local: no llama a nada. Empieza al entrar en pantalla; los mensajes
 * salen escalonados y Lola "escribe" antes de contestar. Las sugerencias cambian la rama final.
 */
export function DemoChat() {
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);
  const [started, setStarted] = useState(false);
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [branch, setBranch] = useState<number | null>(null);

  const items = useMemo<DemoMessage[]>(() => {
    if (branch === null) return DEMO_SCRIPT;
    const s = DEMO_SUGGESTIONS[branch];
    return [
      ...DEMO_SCRIPT,
      { from: "cliente", time: "9:45 pm", text: s.label },
      { from: "lola", time: "9:45 pm", text: s.reply },
    ];
  }, [branch]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    if (mq.matches) setStarted(true);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Arranca al entrar en pantalla (una vez por repetición).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || started) return;
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started, run]);

  // Motor del guion: el cliente aparece enseguida; Lola "escribe" y luego contesta.
  useEffect(() => {
    if (!started) return;
    if (shown >= items.length) {
      setTyping(false);
      return;
    }
    if (reduce) {
      setShown(items.length);
      return;
    }
    const next = items[shown];
    if (next.from === "cliente") {
      const t = window.setTimeout(() => setShown((s) => s + 1), shown === 0 ? 350 : 380);
      return () => window.clearTimeout(t);
    }
    setTyping(true);
    const t = window.setTimeout(
      () => {
        setTyping(false);
        setShown((s) => s + 1);
      },
      650 + Math.min(next.text.length, 120) * 4,
    );
    return () => window.clearTimeout(t);
  }, [started, shown, items, reduce]);

  // El registro siempre muestra lo último.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({ top: log.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [shown, typing, reduce]);

  const done = shown >= items.length;
  const scriptDone = shown >= DEMO_SCRIPT.length;

  const pick = (i: number) => {
    if (i === branch) return;
    setTyping(false);
    setShown(DEMO_SCRIPT.length);
    setBranch(i);
  };

  const replay = () => {
    setBranch(null);
    setShown(0);
    setTyping(false);
    setStarted(true);
    setRun((r) => r + 1);
    logRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div ref={rootRef} className="flex flex-col">
      <div className="flex items-center justify-between gap-4 pb-5 light:border-b light:border-line">
        <div className="flex items-center gap-3.5">
          <AgentBlob agent="lola" size={40} />
          <div>
            <p className="text-base font-semibold leading-tight text-ink">{DEMO.chatTitle}</p>
            <p className="t-small mt-0.5 text-ink-3">{DEMO.chatAgent}</p>
          </div>
        </div>
        <p className="t-status text-right">{DEMO.sample}</p>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-label={DEMO.label}
        aria-live="polite"
        data-lenis-prevent
        className="h-[min(600px,72svh)] overflow-y-auto overscroll-contain [scrollbar-width:none] motion-reduce:h-auto motion-reduce:overflow-visible [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 28px, black calc(100% - 28px), transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 28px, black calc(100% - 28px), transparent)",
        }}
      >
        <div className="flex flex-col gap-6 py-7">
          {items.slice(0, shown).map((msg, i) =>
            msg.from === "cliente" ? <ClientBubble key={`${run}-${branch}-${i}`} msg={msg} /> : <LolaMessage key={`${run}-${branch}-${i}`} msg={msg} />,
          )}
          {typing && <Typing key="typing" />}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {scriptDone && (
          <div role="group" aria-label={DEMO.suggestionsLabel} className="flex flex-wrap gap-2.5">
            {DEMO_SUGGESTIONS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                aria-pressed={branch === i}
                onClick={() => pick(i)}
                className={cn(
                  "min-h-11 rounded-field border px-5 py-2.5 text-left text-[0.9375rem] leading-snug transition-[background-color,color,border-color,transform] duration-200 ease-out",
                  "active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  branch === i
                    ? "border-transparent bg-ink text-canvas light:border-ink"
                    : "border-transparent bg-field text-ink hover:bg-ink/[0.14] light:border-line-strong light:bg-canvas light:hover:bg-canvas-alt",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex h-12 items-center justify-between gap-3 rounded-field border border-transparent bg-field pl-5 pr-2 light:border-field-line light:bg-canvas">
          <input
            disabled
            aria-label="Escribir un mensaje"
            placeholder={DEMO.composer}
            className="w-full min-w-0 bg-transparent text-[0.9375rem] text-ink placeholder:text-ink-3 disabled:cursor-not-allowed"
          />
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.1] text-ink-3">
            <Icon name="arrowUp" size={16} />
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small text-ink-3">{DEMO.footer}</p>
          {done && (
            <Button variant="secondary" onClick={replay} className="self-start sm:self-auto">
              {DEMO.replay}
            </Button>
          )}
        </div>

        {branch !== null && done && (
          <p className="t-small text-ink-2 light:text-ink">
            {DEMO.after.before}
            <Link href="/pruebalo" className="text-link underline underline-offset-4 hover:no-underline">
              {DEMO.after.link}
            </Link>
            {DEMO.after.after}
          </p>
        )}
      </div>
    </div>
  );
}
