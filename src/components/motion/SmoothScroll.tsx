"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { FULL, gsap, ScrollTrigger } from "./gsap";
import { lenisStore } from "./lenis-store";

/**
 * Inertial wheel scrolling (Lenis, lerp 0.1) driven by GSAP's ticker and synced with
 * ScrollTrigger. Touch keeps native momentum (syncTouch off). Scrolling is still native
 * underneath, so the keyboard (Space, PageDown, arrows, Home/End), find-in-page and
 * scrollbars work; in-page anchors go through Lenis. Off under reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL, () => {
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: true, autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenisStore.set(lenis);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33); // GSAP's default
        lenis.destroy();
        lenisStore.set(null);
      };
    });
    return () => mm.revert();
  }, []);
  return null;
}
