import type { Shape } from "./dot-shapes";

// The shape the dot field should take: the tiles set it on hover and focus, the field listens.
let current: Shape = "idle";
const listeners = new Set<(s: Shape) => void>();

export const hubShape = {
  get: (): Shape => current,
  set(next: Shape): void {
    if (next === current) return;
    current = next;
    listeners.forEach((l) => l(next));
  },
  subscribe(l: (s: Shape) => void): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
