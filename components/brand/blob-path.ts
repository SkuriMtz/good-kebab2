/**
 * Contorno orgánico cerrado a partir de radios alrededor de un centro
 * (Catmull-Rom → Bézier). Determinista: cada personaje siempre tiene la misma silueta.
 */
export function blobPath(radii: number[], { cx = 60, cy = 62, r = 46, sx = 1, sy = 1 } = {}): string {
  const n = radii.length;
  const pts = radii.map((k, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r * k * sx, cy + Math.sin(a) * r * k * sy] as const;
  });
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}
