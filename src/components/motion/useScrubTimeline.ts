"use client";

import { useLayoutEffect, type RefObject } from "react";
import { DESKTOP, FULL, gsap } from "./gsap";

type Options = { start?: string; end?: string; scrub?: boolean | number; pin?: boolean };

/**
 * A GSAP timeline tied to a section's scroll range (ease "none"; scroll is the clock).
 * `build` adds tweens to the timeline, scoped to the section. Reduced motion: never built,
 * so the section shows whatever its markup and CSS render, which must be the finished state.
 * A layout effect, so a pin is reverted before React removes the node on a route change.
 * With `pin`, it builds only at 768 px and wider (motion-system: no pins on phones).
 */
export function useScrubTimeline(ref: RefObject<HTMLElement | null>, build: (tl: gsap.core.Timeline, q: (s: string) => Element[]) => void, opts: Options = {}) {
  const { start = "top 75%", end = "bottom 25%", scrub = 0.6, pin = false } = opts;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia(el);
    mm.add(pin ? `${FULL} and ${DESKTOP}` : FULL, () => {
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start, end, scrub, pin, invalidateOnRefresh: true } });
      build(tl, gsap.utils.selector(el));
    });
    return () => mm.revert();
    // `build` is defined inline by callers; the timeline is built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, start, end, scrub, pin]);
}
