// Pure geometry for the scroll-drawn thread (design/redesign.html). No DOM here, so it is unit
// tested in geometry.test.ts; Thread.tsx feeds it measured pin positions.

export type Point = readonly [x: number, y: number];

const f1 = (n: number) => n.toFixed(1);

/** A smooth path through every point: Catmull-Rom turned into cubic Béziers (tension 1/5, as the prototype). */
export function spline(points: readonly Point[]): string {
  if (points.length === 0) return "";
  let d = `M${f1(points[0][0])} ${f1(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d +=
      `C${f1(p1[0] + (p2[0] - p0[0]) / 5)} ${f1(p1[1] + (p2[1] - p0[1]) / 5)} ` +
      `${f1(p2[0] - (p3[0] - p1[0]) / 5)} ${f1(p2[1] - (p3[1] - p1[1]) / 5)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}

export type Hypotrochoid = { a: number; d: number; k: number; turns: number; scale: number; rot: number; steps: number; cx: number; cy: number };

/** The kolam's looping curve: a rotated, scaled hypotrochoid centred on (cx, cy). */
export function hypotrochoid({ a, d, k, turns, scale, rot, steps, cx, cy }: Hypotrochoid): string {
  const m = scale / (a + d);
  const co = Math.cos(rot);
  const si = Math.sin(rot);
  let s = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const x = a * Math.cos(t) + d * Math.cos(k * t);
    const y = a * Math.sin(t) - d * Math.sin(k * t);
    s += `${i ? "L" : "M"}${f1(cx + (x * co - y * si) * m)} ${f1(cy + (x * si + y * co) * m)}`;
  }
  return s;
}

/** The kolam's 24 dots: eight spokes, three rings, as fractions of the radius. */
export function kolamDots(cx: number, cy: number, r: number): { cx: number; cy: number }[] {
  const dots: { cx: number; cy: number }[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const b = a + Math.PI / 8;
    for (const [f, ang] of [[0.775, a], [0.935, b], [0.417, b]] as const) {
      dots.push({ cx: cx + r * f * Math.cos(ang), cy: cy + r * f * Math.sin(ang) });
    }
  }
  return dots;
}

/**
 * A lookup from page y to path length. `yAt(i)` is the y of the point at sample i of n; the table
 * holds the running maximum, so it never decreases even where the line loops back up.
 */
export function lengthTable(n: number, yAt: (i: number) => number): number[] {
  const table: number[] = [];
  let max = -Infinity;
  for (let i = 0; i <= n; i++) {
    max = Math.max(max, yAt(i));
    table.push(max);
  }
  return table;
}

/** How much of the path (0..total) is drawn once the reader's eye reaches page y. */
export function lengthFor(table: readonly number[], total: number, y: number): number {
  const n = table.length - 1;
  if (n < 1) return 0;
  if (y <= table[0]) return 0;
  if (y >= table[n]) return total;
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (table[mid] < y) lo = mid + 1;
    else hi = mid;
  }
  const y0 = table[lo - 1];
  const y1 = table[lo];
  const f = y1 > y0 ? (y - y0) / (y1 - y0) : 0;
  return (total * (lo - 1 + f)) / n;
}

export type Band<T extends string> = { name: T; top: number; bottom: number };

/** The band (section) containing page y, or the fallback when y is between sections. */
export function bandAt<T extends string>(bands: readonly Band<T>[], y: number, fallback: T): T {
  for (const b of bands) if (y >= b.top && y < b.bottom) return b.name;
  return fallback;
}

/** Ease for the intro draw (GSAP's power2.inOut, without GSAP). */
export function easeInOutQuad(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 2 * c * c : 1 - (-2 * c + 2) ** 2 / 2;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
