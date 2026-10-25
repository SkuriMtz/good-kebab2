"use client";

import { useEffect, useState } from "react";
import { AgentBlob } from "@/components/brand/agent-blob";
import { AGENTS } from "@/lib/agents";

/** Hacia dónde mira cada personaje: -1 izquierda, 0 al frente, 1 derecha. */
const START = [-1, 1, 1, -1];

function pick(prev: number[]) {
  return prev.map((d) => {
    const options = [-1, 0, 1].filter((o) => o !== d);
    return options[Math.floor(Math.random() * options.length)];
  });
}

/**
 * Los cuatro personajes en 2×2 (como la figura de la portada), mirando a los lados: buscan la página.
 * Los ojos y el cuerpo se desplazan hacia donde miran; cada tanto cambian de dirección.
 * Con "reducir movimiento" quedan quietos, mirando a los lados.
 */
export function LookAround() {
  const [dirs, setDirs] = useState<number[]>(START);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setDirs((d) => pick(d)), 1900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-[420px] grid-cols-2 gap-x-6 gap-y-8 lg:mx-0 lg:ml-auto" aria-hidden="true">
      {AGENTS.map((agent, i) => (
        <div
          key={agent.id}
          className="flex justify-center [transition:translate_700ms_var(--ease-out)] [&_.blob-eye]:[transition:translate_600ms_var(--ease-out)]"
          style={{
            translate: `${dirs[i] * 6}px 0`,
            ["--look" as string]: dirs[i],
          }}
        >
          <AgentBlob
            agent={agent.id}
            size={180}
            alive
            className="h-[128px] w-[128px] sm:h-[168px] sm:w-[168px] [&_.blob-eye]:[translate:calc(var(--look)*3.4px)_0]"
          />
        </div>
      ))}
    </div>
  );
}
