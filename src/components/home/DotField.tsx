"use client";

import { useEffect, useRef } from "react";
import { buildTargets, SHAPES, type Shape } from "./dot-shapes";
import { createDots, settle, setTargets, step, type View } from "./dot-sim";
import { hubShape } from "./hub-shape";
import s from "./home.module.css";

// The home's dot field (runbook v4 W2.6, motion-system "Dot field"): 2D canvas, sprites drawn
// with drawImage, full rate only while the field moves, ~12 fps for the wobble once settled,
// stopped off screen, on hidden tabs and on unmount. Reduced motion: the shape drawn once.

const DOTS_DESKTOP = 1100;
const DOTS_NARROW = 700;
const NARROW_PX = 700;
const MAX_DPR = 2;
const WAKE_FRAMES = 240; // full-rate frames after a shape change
const PROXIMITY_FRAMES = 90; // after the cursor comes near
const SETTLED_ENERGY = 1e-6;
const IDLE_FRAME_MS = 80; // ~12 fps
const WOBBLE = 0.004;
const WOBBLE_SPEED = 0.0012;
const NEAR_PX = 60;

type Sprite = { canvas: HTMLCanvasElement; size: number };

/** One pre-rendered glow per colour: a solid core that fades out over `glow` px. */
function sprite(color: string, radius: number, glow: number, dpr: number): Sprite {
  const canvas = document.createElement("canvas");
  const px = Math.ceil((radius + glow) * 2 * dpr);
  canvas.width = canvas.height = px;
  const g = canvas.getContext("2d");
  if (g) {
    const m = px / 2;
    const grad = g.createRadialGradient(m, m, 0, m, m, m);
    grad.addColorStop(0, color);
    grad.addColorStop(radius / (radius + glow), color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, px, px);
  }
  return { canvas, size: px / dpr };
}

export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setAttribute("data-ready", ""); // hydrated (e2e helpers wait for it)
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
    const n = innerWidth < NARROW_PX ? DOTS_NARROW : DOTS_DESKTOP;

    const targets = Object.fromEntries(SHAPES.map((k) => [k, buildTargets(k, n)])) as Record<Shape, Float32Array>;
    const dots = createDots(n, targets[hubShape.get()]);
    const steel = sprite("rgba(214,224,236,.6)", 1, 1.2, dpr);
    const bronze = sprite("rgba(226,197,158,1)", 1.3, 4, dpr);

    const view: View = { cx: 0, cy: 0, scale: 1 };
    let width = 0;
    let height = 0;
    let mx = -9999;
    let my = -9999;
    let awake = WAKE_FRAMES;
    let visible = true;
    let raf = 0;
    let last = 0;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.n; i++) {
        const w = reduced ? 0 : Math.sin(t * WOBBLE_SPEED + dots.phase[i]) * WOBBLE;
        const sp = dots.bronze[i] ? bronze : steel;
        ctx.drawImage(sp.canvas, view.cx + (dots.x[i] + w) * view.scale - sp.size / 2, view.cy + (dots.y[i] + w) * view.scale - sp.size / 2, sp.size, sp.size);
      }
    };

    const frame = (t: number) => {
      raf = 0;
      if (!visible || document.hidden) return; // resumed by the observers below
      if (awake > 0) {
        const energy = step(dots, view, mx, my);
        draw(t);
        awake = energy < SETTLED_ENERGY ? awake - 1 : Math.max(awake, 30);
        last = t;
      } else if (t - last > IDLE_FRAME_MS) {
        draw(t);
        last = t;
      }
      raf = requestAnimationFrame(frame);
    };
    const wake = (frames: number) => {
      awake = Math.max(awake, frames);
      if (reduced) return;
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const redrawStill = () => {
      settle(dots);
      draw(0);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = r.width;
      height = r.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.cx = width / 2;
      view.cy = height / 2;
      view.scale = Math.min(width / 2.3, height / 1.7);
      if (reduced) redrawStill();
      else wake(120);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    canvas.dataset.shape = hubShape.get();
    const unsubscribe = hubShape.subscribe((shape) => {
      canvas.dataset.shape = shape; // the state, readable by tests
      setTargets(dots, targets[shape]);
      if (reduced) redrawStill();
      else wake(WAKE_FRAMES);
    });

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (mx > -NEAR_PX && my > -NEAR_PX && mx < width + NEAR_PX && my < height + NEAR_PX) wake(PROXIMITY_FRAMES);
    };
    const onLeave = () => {
      mx = my = -9999;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake(1);
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden) wake(1);
    };
    if (!reduced) {
      addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unsubscribe();
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      hubShape.set("idle");
    };
  }, []);

  return <canvas ref={ref} className={s.dots} aria-hidden="true" data-dot-field />;
}
