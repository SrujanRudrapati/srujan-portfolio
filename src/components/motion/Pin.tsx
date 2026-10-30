"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DESKTOP, FULL, gsap, ScrollTrigger } from "./gsap";

type Props = { children: ReactNode; className?: string; /** How long it stays pinned, in viewport heights. */ heights?: number };

/**
 * Pins its children for N viewport heights. Only at 768 px and wider, only with motion; otherwise a plain block.
 * A layout effect, so the pin spacer is removed before React unmounts the node on a route change.
 */
export function Pin({ children, className, heights = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${FULL} and ${DESKTOP}`, () => {
      const st = ScrollTrigger.create({ trigger: el, start: "top top", end: () => `+=${window.innerHeight * heights}`, pin: true, invalidateOnRefresh: true });
      return () => st.kill();
    });
    return () => mm.revert();
  }, [heights]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
