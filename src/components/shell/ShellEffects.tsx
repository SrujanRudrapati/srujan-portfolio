"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { lenisStore } from "./lenis-store";
import { CURSOR_LERP, cursorStateFor, lerp, magneticOffset } from "./pointer";
import s from "./shell.module.css";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine)";
const LENIS_LERP = 0.09;

/**
 * Once per document (root layout): the scroll progress line, Lenis smooth scroll, the
 * custom cursor and magnetic buttons (runbook v4 W1.5, W1.7 to W1.9). Cursor and magnetic
 * only on fine pointers with motion; Lenis off under reduced motion and on touch.
 */
export function ShellEffects() {
  const progress = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  // Progress line: scaleX from the native scroll position, one write per frame.
  useEffect(() => {
    const el = progress.current;
    if (!el) return;
    let raf = 0;
    const write = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    write();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  // Lenis, its own rAF loop.
  useEffect(() => {
    if (matchMedia(REDUCED).matches || !matchMedia(FINE).matches) return;
    const lenis = new Lenis({ lerp: LENIS_LERP, smoothWheel: true, syncTouch: false, anchors: true, autoRaf: false });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    lenisStore.set(lenis);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisStore.set(null);
    };
  }, []);

  // Cursor and magnetic buttons.
  useEffect(() => {
    const ring = cursor.current;
    const tip = dot.current;
    const text = label.current;
    if (!ring || !tip || !text || matchMedia(REDUCED).matches || !matchMedia(FINE).matches) return;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let magnet: HTMLElement | null = null;

    const follow = () => {
      rx = lerp(rx, x, CURSOR_LERP);
      ry = lerp(ry, y, CURSOR_LERP);
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = Math.abs(rx - x) + Math.abs(ry - y) > 0.1 ? requestAnimationFrame(follow) : 0;
    };
    const releaseMagnet = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!ring.hasAttribute("data-on")) {
        rx = x;
        ry = y;
        ring.setAttribute("data-on", "");
      }
      tip.style.transform = `translate(${x}px, ${y}px)`;
      if (!raf) raf = requestAnimationFrame(follow);

      const target = e.target as Element | null;
      const { state, label: word } = cursorStateFor(target);
      ring.dataset.state = state;
      if (text.textContent !== word) text.textContent = word;

      const m = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) releaseMagnet();
      if (m) {
        magnet = m;
        const { dx, dy } = magneticOffset(m.getBoundingClientRect(), x, y);
        m.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    const hide = () => {
      ring.removeAttribute("data-on");
      releaseMagnet();
    };
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      hide();
    };
  }, []);

  // A new page: reset the cursor label (the element under it is gone).
  useEffect(() => {
    const ring = cursor.current;
    if (ring) ring.dataset.state = "";
    if (label.current) label.current.textContent = "";
  }, [pathname]);

  return (
    <>
      <div ref={progress} className={s.progress} aria-hidden="true" />
      <div ref={cursor} className={s.cursor} aria-hidden="true">
        <span className={s.ring} />
        <span ref={label} className={s.cursorLabel} />
      </div>
      <div ref={dot} className={s.cursorDot} aria-hidden="true" />
    </>
  );
}
