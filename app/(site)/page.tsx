import { Link } from "next-view-transitions";
import { AgentBlob } from "@/components/brand/agent-blob";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { AGENTS } from "@/lib/agents";

// Página temporal de la base: el Constructor 1 la reemplaza.
export default function Home() {
  return (
    <>
      <section className="page-w flex min-h-[100dvh] flex-col justify-center gap-8 pt-24">
        <p className="t-label">Para negocios que atienden personas</p>
        <h1 className="t-hero max-w-[12ch]">Que ningún cliente se quede sin respuesta</h1>
        <p className="t-lead">Texto de prueba de la base.</p>
        <div className="flex gap-3">
          <Button size="lg">Únete a la lista</Button>
          <Link href="/contacto" className="text-link">Ir a contacto</Link>
        </div>
      </section>
      {[0, 1, 2].map((k) => (
        <Reveal as="section" key={k} className="page-w py-section">
          <h2 data-r className="t-title">Sección {k + 1}</h2>
          <div data-r className="mt-8 flex flex-wrap gap-6">
            {AGENTS.map((a) => (
              <AgentBlob key={a.id} agent={a.id} size={120} alive />
            ))}
          </div>
          <p data-r className="t-lead mt-6">Párrafo de prueba para revisar el revelado una sola vez.</p>
        </Reveal>
      ))}
    </>
  );
}
