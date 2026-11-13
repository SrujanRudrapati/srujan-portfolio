"use client";

import { useEffect, useRef } from "react";

const TICK_MS = 90;
const SECONDS_PER_DAY = 86_400;
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Records since the page opened, at a given daily rate. It counts only while on screen (an offscreen
 * counter is needless work), and under reduced motion it shows the count once, when it comes into
 * view, instead of changing ten times a second (WCAG 2.2.2). aria-hidden: the sentence before it
 * says what it means, and a live number would be noise.
 */
export function Tick({ perDay, className }: { perDay: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t0 = performance.now();
    const fmt = new Intl.NumberFormat("en-US");
    const write = () => {
      el.textContent = fmt.format(Math.floor(((performance.now() - t0) / 1000) * (perDay / SECONDS_PER_DAY)));
    };
    let id = 0;
    const stop = () => {
      clearInterval(id);
      id = 0;
    };
    const run = () => {
      write();
      if (!id && !matchMedia(REDUCED).matches) id = window.setInterval(write, TICK_MS);
    };
    if (!("IntersectionObserver" in window)) {
      run();
      return stop;
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : stop()));
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [perDay]);
  return (
    <span ref={ref} className={className} aria-hidden="true">
      0
    </span>
  );
}
