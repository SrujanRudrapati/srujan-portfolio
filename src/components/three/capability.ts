// Decides whether the live 3D layer may start. Everything here is cheap and
// three.js-free so it can run in the initial bundle (motion-system: poster first).

import { failStage } from "./stage-store";

export type Tier = "off" | "mobile" | "desktop";

type NavigatorHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

function hasWebGL2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    // Release the probe context at once so it does not count toward the browser's live-context limit.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

let cached: Tier | null = null;
let watching = false;

/** Reduced motion switched on mid-session stops the live layer (posters stay). */
function watchReducedMotion() {
  if (watching) return;
  watching = true;
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    if (e.matches) {
      cached = "off";
      failStage();
    }
  });
}

/** "off" means posters only: reduced motion, low-power hardware, Save-Data, or no WebGL 2. */
export function render3DTier(): Tier {
  watchReducedMotion();
  if (cached) return cached;
  const nav = navigator as NavigatorHints;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || nav.connection?.saveData === true;
  const forced = new URLSearchParams(location.search).get("3d");
  // ?3d=on overrides only the low-power heuristic (for testing on small machines), never reduced motion or missing WebGL.
  if (forced === "off" || reduced || !hasWebGL2()) cached = "off";
  else if (lowPower && forced !== "on") cached = "off";
  else cached = matchMedia("(pointer: fine) and (min-width: 768px)").matches ? "desktop" : "mobile";
  return cached;
}
