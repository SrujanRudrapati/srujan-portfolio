// Target shapes for the home dot field, ported from the approved reference. Coordinates are in
// field units: x roughly in [-1, 1], y in [-0.75, 0.75]; the renderer scales them to the canvas.
// Pure and allocation-light so they can be cached once per shape and unit tested.

export type Shape = "idle" | "work" | "experience" | "about" | "contact";
export const SHAPES: readonly Shape[] = ["idle", "work", "experience", "about", "contact"];
export type Rng = () => number;
type Pt = [number, number];

function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}
const line = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function rectEdge(x: number, y: number, w: number, h: number, t: number): Pt {
  let d = t * 2 * (w + h);
  if (d < w) return [x + d, y];
  d -= w;
  if (d < h) return [x + w, y + d];
  d -= h;
  if (d < w) return [x + w - d, y + h];
  d -= w;
  return [x, y + h - d];
}
const circle = (cx: number, cy: number, r: number, t: number): Pt => [cx + Math.cos(t * Math.PI * 2) * r, cy + Math.sin(t * Math.PI * 2) * r];
const jitter = (p: Pt, j: number, rng: Rng): Pt => [p[0] + (rng() - 0.5) * j, p[1] + (rng() - 0.5) * j];

/** The pipeline: three streams converging into a ring, with a short output line. */
function idle(rng: Rng): Pt {
  const q = rng();
  const ring: Pt = [0.42, 0];
  if (q < 0.22) return jitter(bez([-1, -0.62], [-0.4, -0.62], [-0.25, 0], ring, rng()), 0.012, rng);
  if (q < 0.44) return jitter(line([-1, 0], ring, rng()), 0.012, rng);
  if (q < 0.66) return jitter(bez([-1, 0.62], [-0.4, 0.62], [-0.25, 0], ring, rng()), 0.012, rng);
  if (q < 0.86) return jitter(circle(ring[0], ring[1], 0.2, rng()), 0.01, rng);
  if (q < 0.94) return jitter(line([0.62, 0], [1, 0], rng()), 0.01, rng);
  return jitter(circle(ring[0], ring[1], 0.03, rng()), 0.02, rng);
}

/** Three overlapping plates. */
function work(rng: Rng): Pt {
  const q = rng();
  const k = q < 0.33 ? 0 : q < 0.66 ? 1 : 2;
  return jitter(rectEdge(-0.78 + k * 0.46, -0.5 + k * 0.08, 0.62, 0.92, rng()), 0.008, rng);
}

/** Timeline bars on an axis, with a milestone diamond. */
const BARS: readonly [number, number, number][] = [
  [-0.88, -0.42, 0.16],
  [-0.66, -0.12, 1.02],
  [0.46, 0.18, 0.36],
  [0.74, 0.42, 0],
];
const DIAMOND: readonly Pt[] = [
  [0, -0.08],
  [0.08, 0],
  [0, 0.08],
  [-0.08, 0],
  [0, -0.08],
];
function experience(rng: Rng): Pt {
  if (rng() < 0.12) return jitter(line([-0.9, 0.62], [0.95, 0.62], rng()), 0.006, rng);
  const [x, y, w] = BARS[Math.floor(rng() * BARS.length)];
  if (w === 0) {
    const a = rng() * 4;
    const e = Math.floor(a);
    const f = a - e;
    return jitter([x + DIAMOND[e][0] + (DIAMOND[e + 1][0] - DIAMOND[e][0]) * f, y + DIAMOND[e][1] + (DIAMOND[e + 1][1] - DIAMOND[e][1]) * f], 0.006, rng);
  }
  return jitter(rectEdge(x, y - 0.07, w, 0.14, rng()), 0.006, rng);
}

/** Head and shoulders. */
function about(rng: Rng): Pt {
  const q = rng();
  if (q < 0.42) return jitter(circle(0, -0.25, 0.3, rng()), 0.008, rng);
  if (q < 0.52) return [(rng() - 0.5) * 0.4, -0.25 + (rng() - 0.5) * 0.4];
  return jitter(bez([-0.75, 0.75], [-0.68, 0.2], [0.68, 0.2], [0.75, 0.75], rng()), 0.008, rng);
}

/** An envelope. */
function contact(rng: Rng): Pt {
  const q = rng();
  if (q < 0.62) return jitter(rectEdge(-0.75, -0.45, 1.5, 1, rng()), 0.006, rng);
  if (q < 0.82) return jitter(line([-0.75, -0.45], [0, 0.12], rng()), 0.006, rng);
  return jitter(line([0.75, -0.45], [0, 0.12], rng()), 0.006, rng);
}

const SAMPLERS: Record<Shape, (rng: Rng) => Pt> = { idle, work, experience, about, contact };

/** n target points for a shape, interleaved x,y. Computed once per shape and cached by the field. */
export function buildTargets(shape: Shape, n: number, rng: Rng = Math.random): Float32Array {
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const [x, y] = SAMPLERS[shape](rng);
    out[i * 2] = x;
    out[i * 2 + 1] = y;
  }
  return out;
}

/** A small deterministic generator (mulberry32) for tests and stable layouts. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
