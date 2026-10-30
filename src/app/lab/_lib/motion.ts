"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const FULL = "(prefers-reduced-motion: no-preference)";

/**
 * Prototype motion setup shared by /lab/a, /lab/b and /lab/c. Lenis runs on
 * GSAP's ticker and feeds ScrollTrigger; under reduced motion it never starts
 * and `build` is not called, so the page stays in its final, native-scroll state.
 * Everything `build` creates is scoped to `root` and reverted on unmount.
 */
export function useLabMotion(root: RefObject<HTMLElement | null>, build: (ctx: { isDesktop: boolean }) => void) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia(el);
    mm.add({ full: FULL, desktop: "(min-width: 768px)" }, (c) => {
      const { full, desktop } = c.conditions as { full: boolean; desktop: boolean };
      if (!full) return;
      // CSS keys motion-only layouts (pinned reels, the travelling packet) off this attribute,
      // so no-JS and reduced-motion visitors get the static layout.
      el.dataset.motion = "on";
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      build({ isDesktop: desktop });
      ScrollTrigger.refresh();
      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete el.dataset.motion;
        // Count-ups write interim numbers into the DOM; put the real figures back.
        el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
          n.textContent = n.dataset.count ?? n.textContent;
        });
      };
    });
    return () => mm.revert();
    // `build` is defined inline by each prototype; it runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);
}

/** Splits "~80%", "about 10 million", "1st", "44/44" into a countable number and its fixed text. */
export function parseCount(value: string): { prefix: string; n: number; suffix: string } | null {
  const match = value.match(/^(\D*?)(\d[\d,]*)(.*)$/);
  if (!match) return null;
  const n = Number(match[2].replace(/,/g, ""));
  return Number.isFinite(n) ? { prefix: match[1], n, suffix: match[3] } : null;
}

/**
 * Counts an element's number up from zero as it scrolls in. The final text is already in the HTML
 * and in `data-count` (the source of truth, so a remount never re-reads an interim value).
 */
export function countUp(el: HTMLElement, opts: { trigger?: Element; scrub?: boolean; start?: string } = {}) {
  const finalText = el.dataset.count ?? el.textContent ?? "";
  const parts = parseCount(finalText);
  if (!parts) return;
  const state = { v: 0 };
  const fmt = (v: number) => `${parts.prefix}${Math.round(v).toLocaleString("en-US")}${parts.suffix}`;
  return gsap.fromTo(
    state,
    { v: 0 },
    {
      v: parts.n,
      duration: 1.1,
      ease: opts.scrub ? "none" : "power3.out",
      onUpdate: () => {
        el.textContent = fmt(state.v);
      },
      onComplete: () => {
        el.textContent = finalText;
      },
      scrollTrigger: { trigger: opts.trigger ?? el, start: opts.start ?? "top 85%", scrub: opts.scrub ? 0.6 : false, once: !opts.scrub },
    },
  );
}
