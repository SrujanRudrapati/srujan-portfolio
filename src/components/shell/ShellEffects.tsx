"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CURSOR_LERP, cursorLabelFor, lerp } from "./pointer";
import s from "./shell.module.css";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine)";
const OFFSCREEN = -200;

/**
 * Once per document: the v5 cursor (design/redesign.html ".cur"), a thread-coloured disc that
 * grows to say "View" over the giant headings and the More-projects rows, and is hidden
 * elsewhere. Fine pointers only; off under reduced motion. Scrolling is native (no Lenis).
 */
export function ShellEffects() {
  const cur = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = cur.current;
    const word = text.current;
    if (!el || !word || matchMedia(REDUCED).matches || !matchMedia(FINE).matches) return;
    let x = OFFSCREEN;
    let y = OFFSCREEN;
    let tx = OFFSCREEN;
    let ty = OFFSCREEN;
    let scale = 0;
    let target = 0;
    let raf = 0;

    const follow = () => {
      x = lerp(x, tx, CURSOR_LERP);
      y = lerp(y, ty, CURSOR_LERP);
      scale = lerp(scale, target, CURSOR_LERP);
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      const settled = Math.abs(x - tx) + Math.abs(y - ty) + Math.abs(scale - target) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(follow);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      const label = cursorLabelFor(e.target as Element | null);
      target = label ? 1 : 0;
      if (label && word.textContent !== label) word.textContent = label;
      if (!raf) raf = requestAnimationFrame(follow);
    };
    const leave = () => {
      target = 0;
      if (!raf) raf = requestAnimationFrame(follow);
    };
    el.setAttribute("data-on", "");
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      el.removeAttribute("data-on");
    };
  }, []);

  // A new page: shrink the cursor (the element under it is gone).
  useEffect(() => {
    const el = cur.current;
    if (el) el.style.transform = `translate(${OFFSCREEN}px, ${OFFSCREEN}px) scale(0)`;
  }, [pathname]);

  return (
    <div ref={cur} className={s.cursor} aria-hidden="true">
      <span ref={text}>View</span>
    </div>
  );
}
