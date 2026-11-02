// The dot field's physics (motion-system: spring k 0.018 to 0.048, damping 0.86, cursor
// repulsion within 60px). Typed arrays, mutated in place: no allocation per frame.
import type { Rng } from "./dot-shapes";

export const DAMPING = 0.86;
export const K_MIN = 0.018;
export const K_SPAN = 0.03; // k in [0.018, 0.048]
export const REPEL_PX = 60;
export const REPEL_FORCE = 0.012;
export const BRONZE_SHARE = 0.18;

export type Dots = {
  n: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
  k: Float32Array;
  phase: Float32Array;
  bronze: Uint8Array;
};

/** n dots scattered loosely around the field, heading for `targets` (interleaved x,y). */
export function createDots(n: number, targets: Float32Array, rng: Rng = Math.random): Dots {
  const d: Dots = {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    tx: new Float32Array(n),
    ty: new Float32Array(n),
    k: new Float32Array(n),
    phase: new Float32Array(n),
    bronze: new Uint8Array(n),
  };
  for (let i = 0; i < n; i++) {
    d.x[i] = (rng() - 0.5) * 2.4;
    d.y[i] = (rng() - 0.5) * 1.8;
    d.k[i] = K_MIN + rng() * K_SPAN;
    d.phase[i] = rng() * Math.PI * 2;
    d.bronze[i] = rng() < BRONZE_SHARE ? 1 : 0;
  }
  setTargets(d, targets);
  return d;
}

export function setTargets(d: Dots, targets: Float32Array): void {
  for (let i = 0; i < d.n; i++) {
    d.tx[i] = targets[i * 2];
    d.ty[i] = targets[i * 2 + 1];
  }
}

/** Snap every dot onto its target (reduced motion: the finished shape, drawn once). */
export function settle(d: Dots): void {
  d.x.set(d.tx);
  d.y.set(d.ty);
  d.vx.fill(0);
  d.vy.fill(0);
}

/** The field's mapping from units to canvas pixels. */
export type View = { cx: number; cy: number; scale: number };

/**
 * One physics step. Springs pull each dot to its target; a pointer within 60px pushes dots away.
 * `mx`/`my` are canvas pixels (far away when there is no pointer). Returns the total squared velocity,
 * which the renderer uses to drop to a slow frame rate once the field has settled.
 */
export function step(d: Dots, view: View, mx: number, my: number): number {
  let energy = 0;
  const r2 = REPEL_PX * REPEL_PX;
  for (let i = 0; i < d.n; i++) {
    let ax = (d.tx[i] - d.x[i]) * d.k[i];
    let ay = (d.ty[i] - d.y[i]) * d.k[i];
    const dx = view.cx + d.x[i] * view.scale - mx;
    const dy = view.cy + d.y[i] * view.scale - my;
    const dist2 = dx * dx + dy * dy;
    if (dist2 < r2 && dist2 > 1) {
      const dist = Math.sqrt(dist2);
      const f = ((REPEL_PX - dist) / REPEL_PX) * REPEL_FORCE;
      ax += (dx / dist) * f;
      ay += (dy / dist) * f;
    }
    const vx = (d.vx[i] + ax) * DAMPING;
    const vy = (d.vy[i] + ay) * DAMPING;
    d.vx[i] = vx;
    d.vy[i] = vy;
    d.x[i] += vx;
    d.y[i] += vy;
    energy += vx * vx + vy * vy;
  }
  return energy;
}
