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

/** "off" means posters only: reduced motion, low-power hardware, Save-Data, no WebGL 2, or a phone or tablet. */
export function render3DTier(): Tier {
  watchReducedMotion();
  if (cached) return cached;
  const nav = navigator as NavigatorHints;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || nav.connection?.saveData === true;
  const forced = new URLSearchParams(location.search).get("3d");
  // ?3d=on overrides only the low-power heuristic (for testing on small machines), never reduced motion or missing WebGL.
  // Phones and tablets get the posters (DECISIONS 18, V7): starting three.js costs about 1.9 s of main-thread
  // work on a throttled phone CPU, with a 600 ms task, against the V7 targets (mobile Performance >= 85, no
  // task over 200 ms after load). Decided before the WebGL probe, so phones never create a context at all.
  // ?3d=on still runs the lighter "mobile" tier there, for testing.
  const desktop = matchMedia("(pointer: fine) and (min-width: 768px)").matches;
  if (forced === "off" || reduced || (!desktop && forced !== "on")) cached = "off";
  else if (lowPower && forced !== "on") cached = "off";
  else if (!hasWebGL2()) cached = "off";
  else cached = desktop ? "desktop" : "mobile";
  return cached;
}
