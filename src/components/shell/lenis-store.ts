import type Lenis from "lenis";

// The page's Lenis instance (null when smooth scroll is off: reduced motion, or not mounted).
let lenis: Lenis | null = null;
const listeners = new Set<() => void>();

export const lenisStore = {
  get: () => lenis,
  getServer: () => null,
  set(next: Lenis | null) {
    lenis = next;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
