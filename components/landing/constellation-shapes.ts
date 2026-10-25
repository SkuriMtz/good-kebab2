/**
 * Geometría y muestreo de la figura del hero: una burbuja de chat con tres
 * puntos huecos que se deshace y se vuelve a armar como cuatro círculos con
 * dos ojos huecos cada uno (el equipo). Todo se calcula una vez y se guarda en
 * Float32Array: durante la animación no se crean objetos.
 */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Draw = (ctx: CanvasRenderingContext2D) => void;

/** Burbuja: rectángulo redondeado 1.7 × 1.3, cola abajo a la izquierda, tres puntos huecos (escribiendo). */
const drawBubble: Draw = (ctx) => {
  const x0 = -0.85;
  const y0 = -0.8;
  const w = 1.7;
  const h = 1.3;
  const r = 0.45;
  const body = new Path2D();
  body.moveTo(x0 + r, y0);
  body.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
  body.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
  body.arcTo(x0, y0 + h, x0, y0, r);
  body.arcTo(x0, y0, x0 + w, y0, r);
  body.closePath();
  const tail = new Path2D();
  tail.moveTo(-0.64, y0 + h - 0.06);
  tail.lineTo(-0.76, 0.86);
  tail.lineTo(-0.18, y0 + h - 0.06);
  tail.closePath();
  ctx.fill(body);
  ctx.fill(tail);
  ctx.globalCompositeOperation = "destination-out";
  const cy = y0 + h / 2;
  for (const x of [-0.3, 0, 0.3]) {
    ctx.beginPath();
    ctx.arc(x, cy, 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
};

/** Equipo: cuatro círculos 2 × 2 (R 0.44) con dos ojos huecos cada uno. */
const drawTeam: Draw = (ctx) => {
  const centers: [number, number][] = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
  ];
  for (const [cx, cy] of centers) {
    ctx.beginPath();
    ctx.arc(cx, cy, 0.44, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "destination-out";
  for (const [cx, cy] of centers) {
    for (const dx of [-0.16, 0.16]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy - 0.06, 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = "source-over";
};

/** Elige `n` puntos (en coordenadas unitarias [-1, 1]) repartidos en la forma, con rejilla y jitter. */
function samplePoints(draw: Draw, size: number, n: number, rand: () => number) {
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { x: new Float32Array(n), y: new Float32Array(n) };
  ctx.setTransform(size / 2, 0, 0, size / 2, size / 2, size / 2);
  ctx.fillStyle = "#000";
  draw(ctx);
  const data = ctx.getImageData(0, 0, size, size).data;

  const inside: number[] = [];
  for (let i = 0; i < size * size; i++) if (data[i * 4 + 3] > 127) inside.push(i);
  const step = Math.max(1, Math.sqrt(inside.length / n));
  const cells = Math.ceil(size / step);
  const pts: number[] = [];
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      for (let tries = 0; tries < 6; tries++) {
        const px = Math.floor((cx + rand()) * step);
        const py = Math.floor((cy + rand()) * step);
        if (px < size && py < size && data[(py * size + px) * 4 + 3] > 127) {
          pts.push(px + rand(), py + rand());
          break;
        }
      }
    }
  }
  // Si sobran, se quitan al azar; si faltan, se completan con jitter de ±0.5 px.
  let count = pts.length / 2;
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tx = pts[i * 2];
    const ty = pts[i * 2 + 1];
    pts[i * 2] = pts[j * 2];
    pts[i * 2 + 1] = pts[j * 2 + 1];
    pts[j * 2] = tx;
    pts[j * 2 + 1] = ty;
  }
  while (count < n && inside.length) {
    const idx = inside[Math.floor(rand() * inside.length)];
    pts.push((idx % size) + rand(), Math.floor(idx / size) + rand());
    count++;
  }
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = (pts[i * 2] / size) * 2 - 1;
    y[i] = (pts[i * 2 + 1] / size) * 2 - 1;
  }
  return { x, y };
}

/** Orden por (sector angular, radio): así A_i y B_i viajan en abanico y no se cruzan todas. */
function fanOrder(x: Float32Array, y: Float32Array) {
  const n = x.length;
  const key = new Float32Array(n);
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    const ang = Math.atan2(y[i], x[i]);
    const sector = Math.min(47, Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 48));
    key[i] = sector * 10 + Math.hypot(x[i], y[i]);
    idx[i] = i;
  }
  return Array.from(idx).sort((a, b) => key[a] - key[b]);
}

export type Cloud = {
  n: number;
  /** Posición de la burbuja y del equipo (unidades [-1, 1]). */
  ax: Float32Array;
  ay: Float32Array;
  bx: Float32Array;
  by: Float32Array;
  /** Vector de dispersión (dentro del disco unidad), retraso (0–1) y fase de la deriva. */
  sx: Float32Array;
  sy: Float32Array;
  d: Float32Array;
  ph: Float32Array;
  /** Tres vértices del triángulo, en px, respecto a su centro (orientación fija). */
  tri: Float32Array;
  /** Las partículas están ordenadas por grupo (color × nivel de opacidad). */
  groupStart: Uint32Array;
};

type CloudOptions = {
  count: number;
  /** Lado del canvas de muestreo (384 escritorio, 256 celular). */
  sample: number;
  /** Lado del triángulo en px: mínimo y máximo. */
  side: [number, number];
  seed: number;
  colorWeights: number[];
  levelWeights: number[];
};

function pickWeighted(weights: number[], r: number) {
  let total = 0;
  for (const w of weights) total += w;
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i] / total;
    if (r <= acc) return i;
  }
  return weights.length - 1;
}

export function buildCloud({ count, sample, side, seed, colorWeights, levelWeights }: CloudOptions): Cloud {
  const rand = mulberry32(seed);
  const A = samplePoints(drawBubble, sample, count, rand);
  const B = samplePoints(drawTeam, sample, count, rand);
  const ordA = fanOrder(A.x, A.y);
  const ordB = fanOrder(B.x, B.y);

  // Orden de dibujo al azar (para poder bajar la calidad quitando partículas sin que se note).
  const perm = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }

  const levels = levelWeights.length;
  const groups = colorWeights.length * levels;
  const groupOf = new Uint8Array(count);
  const counts = new Uint32Array(groups + 1);
  for (let i = 0; i < count; i++) {
    const g = pickWeighted(colorWeights, rand()) * levels + pickWeighted(levelWeights, rand());
    groupOf[i] = g;
    counts[g + 1]++;
  }
  for (let g = 0; g < groups; g++) counts[g + 1] += counts[g];
  const groupStart = counts.slice();
  const cursor = counts.slice(0, groups);

  const cloud: Cloud = {
    n: count,
    ax: new Float32Array(count),
    ay: new Float32Array(count),
    bx: new Float32Array(count),
    by: new Float32Array(count),
    sx: new Float32Array(count),
    sy: new Float32Array(count),
    d: new Float32Array(count),
    ph: new Float32Array(count),
    tri: new Float32Array(count * 6),
    groupStart,
  };

  for (let k = 0; k < count; k++) {
    const src = perm[k]; // partícula (en orden de abanico) que ocupa este lugar al azar
    const slot = cursor[groupOf[k]]++;
    cloud.ax[slot] = A.x[ordA[src]];
    cloud.ay[slot] = A.y[ordA[src]];
    cloud.bx[slot] = B.x[ordB[src]];
    cloud.by[slot] = B.y[ordB[src]];
    const ang = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand());
    cloud.sx[slot] = Math.cos(ang) * rad;
    cloud.sy[slot] = Math.sin(ang) * rad;
    cloud.d[slot] = rand();
    cloud.ph[slot] = rand() * Math.PI * 2;
    const circumradius = (side[0] + rand() * (side[1] - side[0])) / Math.sqrt(3);
    const rot = rand() * Math.PI * 2;
    for (let v = 0; v < 3; v++) {
      const a = rot + (v * Math.PI * 2) / 3;
      cloud.tri[slot * 6 + v * 2] = Math.cos(a) * circumradius;
      cloud.tri[slot * 6 + v * 2 + 1] = Math.sin(a) * circumradius;
    }
  }
  return cloud;
}
