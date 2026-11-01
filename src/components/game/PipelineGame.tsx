"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { createWorld, PADDLE_Y, SILVER_Y, step, WORLD_H, WORLD_W, type Input, type World } from "./pipeline-sim";
import s from "./game.module.css";

// "Clean the pipeline" (runbook V1.5 / V6): the drawing, the input and the loop around
// pipeline-sim. Starts only when asked (never autoplays), no sound, pauses when the tab is
// hidden or the game scrolls off screen. Keyboard: arrows or A/D move, Space or P pauses.
// Touch and mouse: drag on the board. Score and lives are DOM text; misses and the end of a
// run are announced. The best score is a per-browser convenience (localStorage, guarded).

type Phase = "ready" | "playing" | "paused" | "over";

const BEST_KEY = "clean-the-pipeline:best";
const MAX_DT = 1 / 30;
const DPR_MAX = 2;
const LABEL: Record<string, string> = { null: "null", duplicate: "dup", malformed: "{bad" };

function readBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
const BEST_EVENT = "clean-the-pipeline:best";
function writeBest(n: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(n));
  } catch {
    // Private mode or blocked storage: the best score just is not remembered.
  }
  window.dispatchEvent(new Event(BEST_EVENT));
}
/** The stored best as an external store: 0 on the server and before hydration, so markup matches. */
function subscribeBest(onChange: () => void) {
  window.addEventListener(BEST_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(BEST_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

type Band = { y0: number; y1: number; color: string; label: string; gold: boolean };
/** Colours plus everything draw() would otherwise rebuild each frame (bands, fonts). Rebuilt on theme change only. */
type Palette = { bg: string; ink: string; muted: string; accent: string; bronze: string; silver: string; gold: string; bands: Band[]; bandFont: string; recordFont: string };
function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const bronze = v("--bronze", "#9a5f35");
  const silver = v("--silver", "#7c838b");
  const gold = v("--gold", "#9c7a1c");
  const mono = `${v("--font-mono", "ui-monospace")}, ui-monospace, monospace`;
  return {
    bg: v("--bg", "#fff"),
    ink: v("--text", "#000"),
    muted: v("--text-muted", "#5c5c5c"),
    accent: v("--accent", "#1d4ed8"),
    bronze,
    silver,
    gold,
    bands: [
      { y0: 0, y1: SILVER_Y, color: bronze, label: "bronze / raw", gold: false },
      { y0: SILVER_Y, y1: PADDLE_Y, color: silver, label: "silver / cleaned", gold: false },
      { y0: PADDLE_Y, y1: WORLD_H, color: gold, label: "gold / modeled", gold: true },
    ],
    bandFont: `11px ${mono}`,
    recordFont: `10px ${mono}`,
  };
}

function draw(ctx: CanvasRenderingContext2D, w: World, c: Palette, flash: number) {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  ctx.font = c.bandFont;
  for (const b of c.bands) {
    ctx.globalAlpha = b.gold && flash > 0 ? 0.12 + 0.3 * flash : 0.1;
    ctx.fillStyle = b.color;
    ctx.fillRect(0, b.y0, WORLD_W, b.y1 - b.y0);
    ctx.globalAlpha = 1;
    ctx.fillText(b.label, 8, b.y0 + 16);
  }
  ctx.fillStyle = c.muted;
  for (const p of w.pegs) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = c.recordFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const r of w.recs) {
    const band = r.y < SILVER_Y ? c.bronze : r.y < PADDLE_Y ? c.silver : c.gold;
    ctx.fillStyle = c.bg;
    ctx.fillRect(r.x - r.r, r.y - r.r, r.r * 2, r.r * 2);
    ctx.strokeStyle = band;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x - r.r, r.y - r.r, r.r * 2, r.r * 2);
    ctx.fillStyle = c.ink;
    ctx.fillText(LABEL[r.kind], r.x, r.y + 0.5);
  }
  const p = w.paddle;
  ctx.fillStyle = c.accent;
  ctx.fillRect(p.x - p.w / 2, p.y, p.w, p.h);
  ctx.fillStyle = c.accent;
  ctx.fillText("filter", p.x, p.y + p.h + 10);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

export function PipelineGame({ autoFocus = false }: { autoFocus?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [idleWorld] = useState(createWorld); // built once; createWorld allocates, so not on every render
  const world = useRef<World>(idleWorld);
  const helpId = useId();
  const input = useRef<Input>({ dir: 0 });
  const keys = useRef({ left: false, right: false });
  const palette = useRef<Palette | null>(null);
  const flash = useRef(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const storedBest = useSyncExternalStore(subscribeBest, readBest, () => 0);
  const [announce, setAnnounce] = useState("");
  const phaseRef = useRef<Phase>("ready");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    palette.current ??= readPalette();
    const scale = canvas.width / WORLD_W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    draw(ctx, world.current, palette.current, flash.current);
  }, []);

  // Size the backing store to the element (crisp at any DPR), and repaint on resize and theme change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1);
      const width = canvas.clientWidth;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round((width * WORLD_H * dpr) / WORLD_W);
      paint();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeChanged = () => {
      palette.current = null;
      paint();
    };
    const mo = new MutationObserver(themeChanged);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", themeChanged);
    if (autoFocus) rootRef.current?.querySelector("button")?.focus();
    return () => {
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", themeChanged);
    };
  }, [paint, autoFocus]);

  // The loop: runs only while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(MAX_DT, (now - last) / 1000);
      last = now;
      const k = keys.current;
      if (input.current.targetX === undefined) input.current.dir = k.left === k.right ? 0 : k.left ? -1 : 1;
      const w = step(world.current, dt, input.current);
      flash.current = Math.max(0, flash.current - dt * 3);
      for (const e of w.events) {
        if (e === "caught") setScore(w.score);
        if (e === "missed") {
          flash.current = 1;
          setLives(w.lives);
          if (w.lives > 0) setAnnounce(`Missed one. ${w.lives} ${w.lives === 1 ? "life" : "lives"} left.`);
        }
        if (e === "over") {
          setPhase("over");
          setAnnounce(`Game over. Score ${w.score}.`);
          if (w.score > readBest()) writeBest(w.score);
        }
      }
      paint();
      if (!w.over) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase, paint]);

  // Pause when the tab is hidden or the board leaves the screen.
  useEffect(() => {
    const pause = () => phaseRef.current === "playing" && setPhase("paused");
    const onVis = () => document.hidden && pause();
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => !e?.isIntersecting && pause());
    if (canvasRef.current) io.observe(canvasRef.current);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  const releaseKeys = useCallback(() => {
    keys.current = { left: false, right: false };
    input.current = { dir: 0 };
  }, []);
  // A key held when play stops (pause, blur, game over) must not keep steering after it resumes.
  useEffect(() => {
    if (phase !== "playing") releaseKeys();
  }, [phase, releaseKeys]);

  const start = useCallback(() => {
    world.current = createWorld();
    releaseKeys();
    flash.current = 0;
    setScore(0);
    setLives(3);
    setAnnounce("Started. Catch the bad records before they reach gold.");
    setPhase("playing");
    canvasRef.current?.focus({ preventScroll: true });
  }, [releaseKeys]);
  // 6: pause and resume are announced, like misses and the end of a run.
  const togglePause = useCallback(() => {
    const next = phaseRef.current === "playing" ? "paused" : phaseRef.current === "paused" ? "playing" : null;
    if (!next) return;
    setPhase(next);
    setAnnounce(next === "paused" ? "Paused." : "Resumed.");
  }, []);

  const onKey = (e: KeyboardEvent, down: boolean) => {
    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keys.current.left = down;
    else if (key === "arrowright" || key === "d") keys.current.right = down;
    else if (down && (key === " " || key === "p") && (phase === "playing" || phase === "paused")) togglePause();
    else if (down && (key === " " || key === "enter") && (phase === "ready" || phase === "over")) start();
    else return;
    input.current.targetX = undefined; // keys take over from the pointer
    e.preventDefault();
  };
  // Mouse: the filter follows the cursor over the board. Touch: it follows the finger while it is down.
  const onPointer = (e: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    input.current.targetX = ((e.clientX - rect.left) / rect.width) * WORLD_W;
  };

  const label = phase === "ready" ? "Start" : phase === "over" ? "Play again" : phase === "paused" ? "Resume" : "Pause";
  return (
    <div ref={rootRef} className={s.game}>
      <div className={s.bar}>
        <p className={s.stats}>
          <span>
            score <b>{score}</b>
          </span>
          <span>
            lives <b>{lives}</b>
          </span>
          <span>
            best <b>{storedBest}</b>
          </span>
        </p>
        <button type="button" className={s.button} onClick={phase === "ready" || phase === "over" ? start : togglePause}>
          {label}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className={s.board}
        data-phase={phase}
        tabIndex={0}
        role="application"
        aria-roledescription="game"
        aria-label="Game board: bad records fall through the bronze and silver bands; the blue filter at the top of gold catches them."
        aria-describedby={helpId}
        onBlur={releaseKeys}
        onKeyDown={(e) => onKey(e, true)}
        onKeyUp={(e) => onKey(e, false)}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
      />
      <p id={helpId} className={s.help}>
        Catch the bad records (null, dup, malformed) with the filter before they reach gold. Move with the arrow keys or A and D, or drag on the board. Space or P pauses. Three misses and the run ends.
      </p>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      {phase === "over" && (
        <p className={s.over}>
          Pipeline stopped. {score} bad {score === 1 ? "record" : "records"} caught.
        </p>
      )}
    </div>
  );
}
