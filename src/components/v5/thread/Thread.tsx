"use client";

import { useEffect, useRef } from "react";
import { applyTheme, DEFAULT_THEME, type ThemeName } from "@/lib/themes";
import { bandAt, clamp01, easeInOutQuad, hypotrochoid, kolamDots, lengthFor, lengthTable, spline, type Point } from "./geometry";
import { fitGiants, measure, type Layout } from "./measure";
import s from "../art.module.css";

const SAMPLES = 900;
const BEADS = 6;
const BEAD_SPAN_MAX = 2600;
const DRAW_AT = 0.64; // the line's tip follows 64% down the viewport
const THEME_AT = 0.55; // a section's theme applies when it crosses 55% of the viewport
const PARALLAX = -0.14;
const INTRO = { delay: 400, duration: 2200 };
const REDUCED = "(prefers-reduced-motion: reduce)";

/** The built path, with x and y cached at every sample so the loop never measures the path per frame. */
type Built = Layout & { top: number; total: number; table: number[]; xs: Float64Array; ys: Float64Array; kLen: number; kiLen: number };

/** A point at length l along the built path, interpolated between cached samples. */
function pointAt(b: Built, l: number): { x: number; y: number } {
  const f = (Math.min(Math.max(l, 0), b.total) / (b.total || 1)) * SAMPLES;
  const i = Math.min(SAMPLES - 1, Math.floor(f));
  const t = f - i;
  return { x: b.xs[i] + (b.xs[i + 1] - b.xs[i]) * t, y: b.ys[i] + (b.ys[i + 1] - b.ys[i]) * t };
}

/**
 * The scroll-drawn thread (design/redesign.html): one SVG line through every pin on the page,
 * weaving through the giant headings, ending in the kolam at "Let's talk". It also fits the
 * giant headings, sets each section's theme on <html>, moves the ghosts, and marks sections
 * [data-in] as they scroll into view so their scenes draw. Mount it once inside the page's
 * position:relative container.
 */
export function Thread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const kMainRef = useRef<SVGPathElement>(null);
  const kInnerRef = useRef<SVGPathElement>(null);
  const kDotsRef = useRef<SVGGElement>(null);
  const beadsRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const line = lineRef.current;
    const kMain = kMainRef.current;
    const kInner = kInnerRef.current;
    const kDots = kDotsRef.current;
    const beadsG = beadsRef.current;
    const head = headRef.current;
    const halo = haloRef.current;
    const box = svg?.parentElement;
    if (!svg || !line || !kMain || !kInner || !kDots || !beadsG || !head || !halo || !box) return;

    const root = document.documentElement;
    const motionQuery = matchMedia(REDUCED);
    let reduce = motionQuery.matches;
    let disposed = false;
    const beads = Array.from(beadsG.children) as SVGCircleElement[];
    let built: Built | null = null;
    let theme: ThemeName | null = null;
    let drawn = 0;
    let lastY = Number.NaN;
    let kf = reduce ? 1 : 0;
    const start = performance.now();

    function build() {
      if (disposed || !svg || !line || !kMain || !kInner || !kDots || !box) return;
      fitGiants(box);
      svg.style.height = "0px";
      const layout = measure(box);
      svg.style.height = `${layout.height}px`;
      svg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);

      const pts: Point[] = [...layout.pins];
      let kLen = 0;
      let kiLen = 0;
      kDots.replaceChildren();
      if (layout.kolam) {
        const [cx, cy] = layout.kolam;
        const r = Math.min(layout.width * 0.46, innerHeight * 0.44, 420);
        pts.push([cx + r * 0.9, cy - r * 0.95], [cx + r, cy]);
        kMain.setAttribute("d", hypotrochoid({ a: 5, d: 4, k: 5 / 3, turns: 3, scale: r, rot: 0, steps: 900, cx, cy }));
        kInner.setAttribute("d", hypotrochoid({ a: 7, d: 2, k: 7, turns: 1, scale: r * 0.5, rot: Math.PI / 8, steps: 600, cx, cy }));
        kLen = kMain.getTotalLength();
        kiLen = kInner.getTotalLength();
        kMain.style.strokeDasharray = `${kLen} ${kLen}`;
        kInner.style.strokeDasharray = `${kiLen} ${kiLen}`;
        const dotR = Math.max(2.2, r * 0.013).toFixed(1);
        for (const d of kolamDots(cx, cy, r)) {
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          c.setAttribute("cx", d.cx.toFixed(1));
          c.setAttribute("cy", d.cy.toFixed(1));
          c.setAttribute("r", dotR);
          kDots.appendChild(c);
        }
      }
      if (pts.length < 2) {
        built = null;
        return;
      }
      line.setAttribute("d", spline(pts));
      const total = line.getTotalLength();
      line.style.strokeDasharray = `${total} ${total}`;
      const xs = new Float64Array(SAMPLES + 1);
      const ys = new Float64Array(SAMPLES + 1);
      for (let i = 0; i <= SAMPLES; i++) {
        const p = line.getPointAtLength((total * i) / SAMPLES);
        xs[i] = p.x;
        ys[i] = p.y;
      }
      const table = lengthTable(SAMPLES, (i) => ys[i]);
      const top = box.getBoundingClientRect().top + scrollY;
      built = { ...layout, top, total, table, xs, ys, kLen, kiLen };
      lastY = Number.NaN;
      wake();
      svg.setAttribute("data-ready", ""); // tests wait on this instead of a timeout
    }

    function onScrollChange(y: number, vh: number, b: Built) {
      const name = bandAt(b.bands, y + vh * THEME_AT, theme ?? DEFAULT_THEME);
      if (name !== theme) {
        theme = name;
        applyTheme(root, name);
      }
      const last = b.bands[b.bands.length - 1];
      if (!reduce && last) kf = clamp01((y + vh * 0.6 - last.top) / Math.max(1, last.bottom - last.top - vh * 0.4));
      for (const g of b.ghosts) {
        const off = reduce ? 0 : (g.mid - (y + vh / 2)) * PARALLAX;
        if (Math.abs(off) < vh) g.el.style.transform = `translate3d(0,${off.toFixed(1)}px,0) rotate(${g.rot}deg)`;
      }
    }

    let raf = 0;
    let last = performance.now();
    let clock = 0;
    /** Schedules a frame if none is pending (the loop sleeps once nothing moves under reduced motion). */
    function wake() {
      if (!raf && !disposed) raf = requestAnimationFrame(frame);
    }
    function frame(now: number) {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;
      const b = built;
      if (!b || !line || !head || !halo || !kMain || !kInner || !kDots) return;
      const y = scrollY - b.top;
      const vh = innerHeight;
      const moved = y !== lastY;
      if (moved) {
        lastY = y;
        onScrollChange(y, vh, b);
      }
      const intro = reduce ? 1 : easeInOutQuad((now - start - INTRO.delay) / INTRO.duration);
      const goal = lengthFor(b.table, b.total, y + vh * DRAW_AT) * intro;
      drawn += (goal - drawn) * (reduce ? 1 : 1 - Math.exp(-dt * 7));
      line.style.strokeDashoffset = (b.total - drawn).toFixed(1);

      const tip = pointAt(b, drawn);
      const hideHead = drawn > b.total - 2 && kf > 0.02;
      head.setAttribute("cx", String(tip.x));
      head.setAttribute("cy", String(tip.y));
      halo.setAttribute("cx", String(tip.x));
      halo.setAttribute("cy", String(tip.y));
      halo.setAttribute("r", (14 + (reduce ? 0 : Math.sin(clock * 3) * 3)).toFixed(1));
      head.style.opacity = hideHead ? "0" : "1";
      halo.style.opacity = hideHead ? "0" : "0.2";

      const span = Math.min(drawn, BEAD_SPAN_MAX);
      beads.forEach((bead, i) => {
        if (drawn < 160 || reduce) {
          bead.style.opacity = "0";
          return;
        }
        const l = drawn - span + ((clock * 170 + (i * span) / beads.length) % span);
        const p = pointAt(b, l);
        bead.setAttribute("cx", String(p.x));
        bead.setAttribute("cy", String(p.y));
        bead.style.opacity = String(Math.min(1, (l - (drawn - span)) / 80, (drawn - l) / 80));
      });

      kMain.style.strokeDashoffset = (b.kLen * (1 - Math.min(1, kf / 0.8))).toFixed(1);
      kInner.style.strokeDashoffset = (b.kiLen * (1 - clamp01((kf - 0.55) / 0.45))).toFixed(1);
      kDots.style.opacity = String(Math.min(1, kf * 3));
      // With motion the beads and halo keep moving; under reduced motion the loop sleeps until the next scroll.
      if (!reduce || moved || Math.abs(goal - drawn) > 0.5) raf = requestAnimationFrame(frame);
    }

    // Sections and cards reveal ([data-in]) the first time they are 12% on screen.
    const reveal = box.querySelectorAll<HTMLElement>("[data-reveal]");
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.setAttribute("data-in", "");
            io?.unobserve(e.target);
          }
        },
        { threshold: 0.12 },
      );
      reveal.forEach((el) => io?.observe(el));
    } else reveal.forEach((el) => el.setAttribute("data-in", ""));

    let width = innerWidth;
    let timer = 0;
    const rebuildSoon = () => {
      clearTimeout(timer);
      timer = window.setTimeout(build, 150);
    };
    const onResize = () => {
      if (innerWidth === width) return; // phones fire resize when the URL bar moves
      width = innerWidth;
      rebuildSoon();
    };
    let height = box.scrollHeight;
    const ro = new ResizeObserver(() => {
      if (box.scrollHeight === height) return;
      height = box.scrollHeight;
      rebuildSoon();
    });
    ro.observe(box);

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduce = e.matches;
      if (reduce) kf = 1;
      lastY = Number.NaN;
      wake();
    };
    // Print on paper, not on whichever section colours are showing.
    const beforePrint = () => applyTheme(root, null);
    const afterPrint = () => theme && applyTheme(root, theme);

    build();
    wake();
    addEventListener("scroll", wake, { passive: true });
    addEventListener("beforeprint", beforePrint);
    addEventListener("afterprint", afterPrint);
    motionQuery.addEventListener("change", onMotionChange);
    addEventListener("resize", onResize);
    addEventListener("load", build);
    document.fonts?.ready.then(build).catch(() => undefined);
    const late = window.setTimeout(build, 1200);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("scroll", wake);
      removeEventListener("beforeprint", beforePrint);
      removeEventListener("afterprint", afterPrint);
      motionQuery.removeEventListener("change", onMotionChange);
      clearTimeout(timer);
      clearTimeout(late);
      removeEventListener("resize", onResize);
      removeEventListener("load", build);
      ro.disconnect();
      io?.disconnect();
      // Leave other pages on paper at once: a 0.9 s fade from night would cross ink and ground mid-way.
      root.style.transition = "none";
      applyTheme(root, null);
      void root.offsetWidth;
      root.style.transition = "";
    };
  }, []);

  return (
    <svg ref={svgRef} className={s.thread} aria-hidden="true" data-thread="">
      <path ref={kInnerRef} strokeWidth="1.3" opacity=".75" />
      <path ref={kMainRef} strokeWidth="1.8" />
      <g ref={kDotsRef} className={s.threadFill} />
      <path ref={lineRef} strokeWidth="2.4" />
      <g ref={beadsRef} className={s.beads}>
        {Array.from({ length: BEADS }, (_, i) => (
          <circle key={i} r="2.8" style={{ opacity: 0 }} />
        ))}
      </g>
      <circle ref={haloRef} className={s.threadFill} r="14" opacity=".2" />
      <circle ref={headRef} className={s.threadFill} r="5" />
    </svg>
  );
}
