"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// One registration point for the core plugin every primitive needs. SplitText and
// Flip are registered by the primitives that use them, so routes that do not use
// them never download them (motion-system: code-split GSAP plugins per route).
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** gsap.matchMedia conditions. Motion only ever runs under FULL; REDUCED gets the finished state. */
export const FULL = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 768px)";
export const FINE_POINTER = "(pointer: fine)";

/** The one easing family (motion-system): power3.out for entrances, none for scrubs. */
export const EASE = "power3.out";
export const ENTRANCE_S = 0.8;
