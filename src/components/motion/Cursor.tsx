"use client";

import { useEffect, useRef } from "react";
import { FINE_POINTER, FULL, gsap } from "./gsap";
import s from "./motion.module.css";

/**
 * An accent ring that trails the pointer, grows over links and buttons, and shows a short
 * label over anything with data-cursor="…" (project cards: "open"). The native cursor is
 * never hidden, so magnifiers and other assistive tech keep it. Desktop fine pointers with
 * motion only; hidden from the accessibility tree.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ring.current;
    const text = label.current;
    if (!el || !text) return;
    const mm = gsap.matchMedia();
    mm.add(`${FULL} and ${FINE_POINTER}`, () => {
      const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
      let shown = false;
      const move = (e: PointerEvent) => {
        if (!shown) {
          shown = true;
          gsap.set(el, { x: e.clientX, y: e.clientY });
          el.dataset.on = "";
        }
        x(e.clientX);
        y(e.clientY);
        const target = (e.target as Element | null)?.closest?.("a, button, [data-cursor]");
        const word = target?.getAttribute("data-cursor") ?? "";
        el.dataset.state = word ? "label" : target ? "link" : "";
        if (text.textContent !== word) text.textContent = word;
      };
      const hide = () => {
        shown = false;
        delete el.dataset.on;
      };
      addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", hide);
      return () => {
        removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", hide);
        hide();
      };
    });
    return () => mm.revert();
  }, []);
  return (
    <div ref={ring} className={s.cursor} aria-hidden>
      <span ref={label} className={s.cursorLabel} />
    </div>
  );
}
