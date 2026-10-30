"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { EASE, FINE_POINTER, FULL, gsap } from "./gsap";

type Props = { children: ReactNode; /** Fraction of the pointer offset to follow, capped at `max` px. */ strength?: number; max?: number };

/** Pulls its child slightly toward the pointer (desktop fine pointers, motion on); springs back on leave. */
export function Magnetic({ children, strength = 0.3, max = 10 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${FULL} and ${FINE_POINTER}`, () => {
      const x = gsap.quickTo(el, "x", { duration: 0.25, ease: EASE });
      const y = gsap.quickTo(el, "y", { duration: 0.25, ease: EASE });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const clamp = gsap.utils.clamp(-max, max);
        x(clamp((e.clientX - (r.left + r.width / 2)) * strength));
        y(clamp((e.clientY - (r.top + r.height / 2)) * strength));
      };
      const leave = () => {
        x(0);
        y(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        gsap.set(el, { x: 0, y: 0 });
      };
    });
    return () => mm.revert();
  }, [strength, max]);
  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}

