"use client";

import { useEffect, useRef } from "react";
import { parseCount, formatCount } from "./count";
import { EASE, FULL, gsap } from "./gsap";

type Props = { value: string; className?: string };

/**
 * A figure that counts up to its value as it arrives. The real value is in the HTML from
 * the start (crawlers, screen readers, no-JS) and in data-count, which is the source of
 * truth: a remount never re-reads an interim number. Approximate values keep "~"/"about".
 * Width is reserved with tabular figures by the caller's class. Reduced motion: static.
 */
export function CountUp({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parts = parseCount(value);
    if (!el || !parts) return;
    const mm = gsap.matchMedia();
    mm.add(FULL, () => {
      const state = { v: 0 };
      // fromTo renders 0 at once (the HTML had the real figure until JS ran), so it never flashes final-then-zero.
      const tween = gsap.fromTo(state, { v: 0 }, {
        v: parts.n,
        duration: 1.1,
        ease: EASE,
        immediateRender: true,
        onUpdate: () => {
          el.textContent = formatCount(parts, state.v);
        },
        onComplete: () => {
          el.textContent = value;
        },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        el.textContent = el.dataset.count ?? el.textContent; // data-count is always the current value
      };
    });
    return () => mm.revert();
  }, [value]);

  return (
    <span ref={ref} className={className} data-count={value}>
      {value}
    </span>
  );
}
