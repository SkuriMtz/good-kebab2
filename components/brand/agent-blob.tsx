import { cn } from "@/lib/cn";
import { getAgent, type AgentId } from "@/lib/agents";
import { blobPath } from "./blob-path";

// Trazo de la carita y rubor: tokens de app/globals.css (--blob-ink, --blob-blush).
const INK = "rgb(var(--blob-ink))";
const BLUSH = "rgb(var(--blob-blush))";

const BODIES: Record<AgentId, string> = {
  lola: blobPath([1, 1.03, 1.05, 1.02, 0.99, 1.03, 1.06, 1.0], { sy: 0.98 }),
  clara: blobPath([1.02, 1, 0.98, 1.01, 1.03, 0.99, 0.98, 1.01], { sx: 0.9, sy: 1.06, cy: 61 }),
  victor: blobPath([0.98, 1.04, 1.02, 1.0, 1.04, 1.01, 1.03, 1.05], { sx: 1.07, sy: 0.94, cy: 64 }),
  iris: blobPath([1.04, 0.97, 1.02, 1.06, 0.98, 1.04, 0.96, 1.02], { sx: 0.97, sy: 1.0 }),
};

function Eye({ x, y, rx = 5.6, ry = 6.6, look = 0 }: { x: number; y: number; rx?: number; ry?: number; look?: number }) {
  return (
    <g className="blob-eye" style={{ transformOrigin: `${x}px ${y}px` }}>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={INK} />
      <circle cx={x - 1.6 + look} cy={y - 2.2} r={1.7} fill="white" />
    </g>
  );
}

function Face({ id }: { id: AgentId }) {
  switch (id) {
    case "lola":
      return (
        <>
          <Eye x={46} y={56} />
          <Eye x={74} y={56} />
          <path d="M47 71 Q60 84 73 71" stroke={INK} strokeWidth={4.2} strokeLinecap="round" fill="none" />
          <ellipse cx={36} cy={69} rx={5} ry={3.2} fill="white" opacity={0.22} />
          <ellipse cx={84} cy={69} rx={5} ry={3.2} fill="white" opacity={0.22} />
        </>
      );
    case "clara":
      return (
        <>
          <circle cx={45.5} cy={57} r={10.5} stroke={INK} strokeWidth={3.4} fill="white" fillOpacity={0.18} />
          <circle cx={74.5} cy={57} r={10.5} stroke={INK} strokeWidth={3.4} fill="white" fillOpacity={0.18} />
          <path d="M56 56 Q60 53.5 64 56" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Eye x={46} y={57.5} rx={3.6} ry={4.2} />
          <Eye x={75} y={57.5} rx={3.6} ry={4.2} />
          <path d="M53 77 Q60 82 67 77" stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none" />
        </>
      );
    case "victor":
      return (
        <>
          <path d="M37 45 Q45 39.5 53 44" stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none" />
          <path d="M67 44 Q75 39.5 83 45" stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none" />
          <Eye x={45} y={56} />
          <Eye x={75} y={56} />
          <path d="M45 69 Q60 70.5 75 69 Q72 86 60 86 Q48 86 45 69 Z" fill={INK} />
          <path d="M53 80.5 Q60 77 67 80.5 Q64 85 60 85 Q56 85 53 80.5 Z" fill={BLUSH} opacity={0.9} />
        </>
      );
    case "iris":
      return (
        <>
          <path d="M37 46.5 L52 45" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
          <Eye x={45} y={57} look={2.4} />
          <Eye x={74} y={57} look={2.4} />
          <path d="M54 75.5 Q61 79 68 74.5" stroke={INK} strokeWidth={3.8} strokeLinecap="round" fill="none" />
        </>
      );
  }
}

type AgentBlobProps = {
  agent: AgentId;
  size?: number;
  className?: string;
  /** Parpadeo de vez en cuando (se apaga con "reducir movimiento"). */
  alive?: boolean;
  /** Si el personaje es solo decoración, déjalo en false. */
  labelled?: boolean;
};

/** Personaje de un agente: un blob redondo con carita, en su color. */
export function AgentBlob({ agent, size = 48, className, alive = false, labelled = false }: AgentBlobProps) {
  const a = getAgent(agent);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("shrink-0", alive && "blob-alive", className)}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? `${a.name}, ${a.area}` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <path d={BODIES[agent]} fill={a.color} />
      <ellipse cx={44} cy={30} rx={13} ry={7} fill="white" opacity={0.2} transform="rotate(-18 44 30)" />
      <Face id={agent} />
    </svg>
  );
}
