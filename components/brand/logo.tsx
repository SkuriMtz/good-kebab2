import { Link } from "next-view-transitions";
import { cn } from "@/lib/cn";
import { blobPath } from "./blob-path";

const MARK = blobPath([1, 1.04, 1.02, 0.99, 1.03, 1.0, 1.05, 1.01], { cx: 16, cy: 16.5, r: 13 });

/** Marca: un blob azul con dos ojos, de la misma familia que los agentes. */
export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden="true">
      <path d={MARK} fill="rgb(var(--brand))" />
      <ellipse cx={12.4} cy={15} rx={1.9} ry={2.3} fill="white" />
      <ellipse cx={19.6} cy={15} rx={1.9} ry={2.3} fill="white" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md text-ink transition-opacity duration-200 hover:opacity-80",
        className,
      )}
      aria-label="Atendel, inicio"
    >
      <LogoMark className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5" />
      <span className="text-[1.3rem] font-normal leading-none tracking-[-0.045em] light:text-[1.2rem] light:font-semibold light:tracking-[-0.03em]">atendel</span>
    </Link>
  );
}
