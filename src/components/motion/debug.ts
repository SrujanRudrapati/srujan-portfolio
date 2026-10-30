"use client";

import { ScrollTrigger } from "./gsap";
import { stageStore } from "@/components/three/stage-store";

// Counters the leak test reads (e2e/motion.spec.ts): live ScrollTriggers, registered 3D
// slots (one View and at most one physics world each), and WebGL canvases.
// Only in development, or with ?motion-debug (the e2e tests pass it), so production pages carry no globals.
export function exposeMotionDebug() {
  if (process.env.NODE_ENV === "production" && !new URLSearchParams(location.search).has("motion-debug")) return;
  (window as unknown as { __motion: object }).__motion = {
    triggers: () => ScrollTrigger.getAll().length,
    slots: () => stageStore.get().length,
    canvases: () => document.querySelectorAll("canvas").length,
  };
}
