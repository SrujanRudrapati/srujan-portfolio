"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { CanvasTexture, Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Object3D, Points, Quaternion, Vector3, BufferGeometry, BufferAttribute, PointsMaterial } from "three";
import { loadStudioEnv } from "../env";
import { rng } from "../rng";
import { useSceneReady } from "../useSceneReady";
import type { SceneProps } from ".";

// Hero: a particle data stream under real forces (runbook V1.5).
// raw (bronze): gravity, a walled bin, bounces with restitution and friction, random kicks of noise.
// cleaned (silver): a field pulls each particle into one of three lanes and carries it along.
// modeled (gold): particles glow and are drawn by springs onto the letters "LLM".
// Scroll sets how far the stream has advanced; the cursor pushes particles away (desktop).
// The integrator is semi-implicit Euler at a fixed 1/120 s step; nothing is keyframed.

const COUNT = { desktop: 2600, mobile: 900, off: 0 } as const;
const STEP = 1 / 120;
const POSTER_PROGRESS = 0.62;
const INTRO_PROGRESS = 0.3;
const CAMERA_Z = 10;
const FOV = 30;

// Metal albedos from the medallion tokens (design-direction, dark values read as metal under the studio light).
const BRONZE = new Color("#D08B57");
const SILVER = new Color("#B5BCC3");
const GOLD = new Color("#E0B84A");

type Layout = { w: number; h: number; vertical: boolean };

/** Samples points inside the glyphs of `text`, in the slot's display face, centred on the origin with the given width. */
function glyphPoints(text: string, count: number, width: number, font: string, rand: () => number) {
  const c = document.createElement("canvas");
  c.width = 600;
  c.height = 240;
  const ctx = c.getContext("2d")!;
  // The display face at its condensed width, matching the name (Archivo 800 at 62%).
  (ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "extra-condensed";
  ctx.font = `800 200px ${font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, 300, 124);
  const px = ctx.getImageData(0, 0, 600, 240).data;
  const filled: number[] = [];
  for (let y = 0; y < 240; y += 2) for (let x = 0; x < 600; x += 2) if (px[(y * 600 + x) * 4 + 3] > 128) filled.push(x, y);
  let minX = 600, maxX = 0;
  for (let i = 0; i < filled.length; i += 2) {
    minX = Math.min(minX, filled[i]);
    maxX = Math.max(maxX, filled[i]);
  }
  const scale = width / Math.max(1, maxX - minX);
  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rand() * (filled.length / 2)) * 2;
    out[i * 2] = (filled[k] - (minX + maxX) / 2 + rand() - 0.5) * scale;
    out[i * 2 + 1] = -(filled[k + 1] - 120 + rand() - 0.5) * scale;
  }
  return out;
}

function haloTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export default function HeroStream({ slot, tier }: SceneProps) {
  const n = COUNT[tier];
  const gl = useThree((s) => s.gl);
  // Layout from the slot's own box (the View's world size at z = 0 for this camera), kept fresh on resize.
  const [box, setBox] = useState(() => ({ w: slot.el.clientWidth || 1, h: slot.el.clientHeight || 1 }));
  useEffect(() => {
    // Debounced, and ignoring sub-pixel jitter (mobile toolbars change dvh while scrolling).
    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const next = { w: slot.el.clientWidth || 1, h: slot.el.clientHeight || 1 };
        setBox((b) => (Math.abs(b.w - next.w) > 8 || Math.abs(b.h - next.h) > 8 ? next : b));
      }, 200);
    });
    ro.observe(slot.el);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [slot.el]);
  const [envReady, setEnvReady] = useState(false);
  useEffect(() => {
    loadStudioEnv(gl)
      .then(() => setEnvReady(true))
      .catch(() => undefined); // failure already switched the page to posters (failStage)
  }, [gl]);
  useSceneReady(slot, envReady);

  const mesh = useRef<InstancedMesh>(null);
  const halo = useRef<Points>(null);
  const layout = useMemo<Layout>(() => {
    const h = 2 * CAMERA_Z * Math.tan((FOV / 2) * (Math.PI / 180));
    return { w: (h * box.w) / box.h, h, vertical: box.w / box.h < 1.05 };
  }, [box.w, box.h]);

  const sim = useMemo(() => {
    const rand = rng(7);
    const { w, h, vertical } = layout;
    const radius = Math.min(w, h) * (tier === "desktop" ? 0.0065 : 0.0105);
    // Zones along the flow axis: raw bin, cleaned lanes, modeled glyphs.
    const along = vertical ? h : w;
    const across = vertical ? w : h;
    const font = getComputedStyle(slot.el).fontFamily || "sans-serif";
    const glyphWidth = (vertical ? w * 0.86 : w * 0.36);
    const glyph = glyphPoints("LLM", n, glyphWidth, font, rand);
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    const order = new Float32Array(n); // when a particle is released down the pipe, 0 to 1
    const lane = new Uint8Array(n);
    const phase = new Float32Array(n);
    const spin = new Float32Array(n * 3);
    const rot = new Float32Array(n * 4);
    const glow = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      order[i] = rand();
      lane[i] = Math.floor(rand() * 3);
      phase[i] = rand();
      for (let k = 0; k < 3; k++) spin[i * 3 + k] = (rand() - 0.5) * 8;
      const q = new Quaternion().setFromAxisAngle(new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), rand() * Math.PI * 2);
      rot.set([q.x, q.y, q.z, q.w], i * 4);
    }
    // Map flow-axis coordinate u (0 = start) and cross coordinate v (0 = centre) to world x, y.
    const toWorld = (u: number, v: number): [number, number] => (vertical ? [v, along / 2 - u] : [u - along / 2, v]);
    const bin = { u0: along * 0.02, u1: along * (vertical ? 0.3 : 0.27), v0: -across * 0.42, v1: across * 0.42 };
    const lanes = { u0: along * (vertical ? 0.34 : 0.31), u1: along * (vertical ? 0.58 : 0.6) };
    const glyphCentre = vertical ? toWorld(along * 0.8, 0) : toWorld(along * 0.8, 0);
    // Raw particles start scattered through the bin.
    for (let i = 0; i < n; i++) {
      const u = bin.u0 + rand() * (bin.u1 - bin.u0);
      const v = bin.v0 + rand() * (bin.v1 - bin.v0);
      const [x, y] = toWorld(u, v);
      pos.set([x, y, (rand() - 0.5) * radius * 30], i * 3);
    }
    // Bin walls in world space. In the horizontal layout gravity pulls to the bin's floor (-y);
    // in the vertical layout the bin is the top band and its floor is the band's lower edge.
    const [bx0, by0] = toWorld(bin.u0, bin.v0);
    const [bx1, by1] = toWorld(bin.u1, bin.v1);
    const box = { x0: Math.min(bx0, bx1), x1: Math.max(bx0, bx1), y0: Math.min(by0, by1), y1: Math.max(by0, by1) };
    return { rand, radius, glyph, pos, vel, order, lane, phase, spin, rot, glow, toWorld, along, across, lanes, glyphCentre, box, vertical };
  }, [layout, n, tier, slot.el]);

  const geometry = useMemo(() => new IcosahedronGeometry(1, 1), []);
  const material = useMemo(() => new MeshStandardMaterial({ metalness: 1, roughness: 0.32, envMapIntensity: 1.2 }), []);
  const haloGeo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3).setUsage(DynamicDrawUsage));
    g.setAttribute("color", new BufferAttribute(new Float32Array(n * 4), 4).setUsage(DynamicDrawUsage));
    return g;
  }, [n]);
  const haloMat = useMemo(() => new PointsMaterial({ size: sim.radius * 7, map: haloTexture(), vertexColors: true, transparent: true, depthWrite: false }), [sim.radius]);
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
    haloGeo.dispose();
    haloMat.map?.dispose();
    haloMat.dispose();
  }, [geometry, material, haloGeo, haloMat]);

  // Cursor in world space at z = 0 (desktop only); null when away.
  const cursor = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (tier !== "desktop" || slot.poster) return;
    const move = (e: PointerEvent) => {
      const r = slot.el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = 0.5 - (e.clientY - r.top) / r.height;
      cursor.current = Math.abs(nx) < 0.6 && Math.abs(ny) < 0.6 ? [nx * layout.w, ny * layout.h] : null;
    };
    const leave = () => (cursor.current = null);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    addEventListener("blur", leave);
    return () => {
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      removeEventListener("blur", leave);
    };
  }, [tier, slot, layout.w, layout.h]);

  const t = useRef(0);
  const acc = useRef(0);
  const shown = useRef(slot.poster ? POSTER_PROGRESS : 0);
  const intro = useRef(0);
  const tmp = useMemo(() => ({ m: new Matrix4(), o: new Object3D(), q: new Quaternion(), dq: new Quaternion(), axis: new Vector3(), c: new Color() }), []);

  const step = (progress: number) => {
    const { pos, vel, order, lane, phase, glyph, lanes, glyphCentre, box, across, along, radius, rand, glow, vertical } = sim;
    const g = Math.min(layout.w, layout.h) * 2.4; // gravity, scaled so a fall across the bin takes about a second
    const cur = cursor.current;
    const laneGap = across * 0.22;
    t.current += STEP;
    for (let i = 0; i < n; i++) {
      const j = i * 3;
      // How far down the pipe this particle is: < 1 raw, 1 to 2 cleaned, >= 2 modeled.
      const q = progress * 4 - order[i] * 2;
      let ax = 0;
      let ay = 0;
      const az = ((((i * 7919) % 97) / 97 - 0.5) * radius * 14 - pos[j + 2]) * 6; // a little depth per particle
      let damp = 0.2;
      let target = 0;
      if (q < 1) {
        // Raw: gravity inside the bin, plus noise kicks.
        ay -= g;
        if (rand() < 0.004) {
          vel[j] += (rand() - 0.5) * g * 0.35;
          vel[j + 1] += rand() * g * 0.45;
        }
        damp = 0.05;
      } else if (q < 2) {
        // Cleaned: a lane field. Target slides along the lane so the stream keeps moving.
        const flow = (phase[i] + t.current * 0.12) % 1;
        const u = lanes.u0 + flow * (lanes.u1 - lanes.u0);
        // Each particle keeps its own offset inside the lane, so a lane reads as a stream, not a line.
        const v = (lane[i] - 1) * laneGap + (phase[i] - 0.5) * laneGap * 0.28;
        // Inline toWorld (no tuple per particle per step).
        const tx = vertical ? v : u - along / 2;
        const ty = vertical ? along / 2 - u : v;
        ax += (tx - pos[j]) * 38;
        ay += (ty - pos[j + 1]) * 38;
        damp = 5.5;
        target = 1;
      } else {
        // Modeled: springs onto the glyph points; they glow.
        const tx = glyphCentre[0] + glyph[i * 2];
        const ty = glyphCentre[1] + glyph[i * 2 + 1] + Math.sin(t.current * 1.4 + phase[i] * 6) * radius * 0.4;
        ax += (tx - pos[j]) * 46;
        ay += (ty - pos[j + 1]) * 46;
        damp = 7;
        target = 2;
      }
      if (cur) {
        const dx = pos[j] - cur[0];
        const dy = pos[j + 1] - cur[1];
        const d2 = dx * dx + dy * dy;
        const r = Math.min(layout.w, layout.h) * 0.16;
        if (d2 < r * r && d2 > 1e-8) {
          const d = Math.sqrt(d2);
          const f = (1 - d / r) * g * 3;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      vel[j] += (ax - vel[j] * damp) * STEP;
      vel[j + 1] += (ay - vel[j + 1] * damp) * STEP;
      vel[j + 2] += (az - vel[j + 2] * damp) * STEP;
      pos[j] += vel[j] * STEP;
      pos[j + 1] += vel[j + 1] * STEP;
      pos[j + 2] += vel[j + 2] * STEP;
      if (target === 0) {
        // Bin collisions: restitution 0.55, wall friction 0.85.
        if (pos[j + 1] < box.y0 + radius) {
          pos[j + 1] = box.y0 + radius;
          if (vel[j + 1] < 0) {
            vel[j + 1] *= -0.55;
            vel[j] *= 0.85;
          }
        }
        if (pos[j + 1] > box.y1 - radius && vel[j + 1] > 0) vel[j + 1] *= -0.55;
        if (pos[j] < box.x0 + radius) {
          pos[j] = box.x0 + radius;
          vel[j] = Math.abs(vel[j]) * 0.55;
        }
        if (pos[j] > box.x1 - radius) {
          pos[j] = box.x1 - radius;
          vel[j] = -Math.abs(vel[j]) * 0.55;
        }
      }
      glow[i] += ((target === 2 ? 1 : 0) - glow[i]) * 0.04;
    }
  };

  const write = () => {
    const { pos, vel, order, spin, rot, glow, radius } = sim;
    const m = mesh.current;
    if (!m) return;
    const hp = haloGeo.getAttribute("position") as BufferAttribute;
    const hc = haloGeo.getAttribute("color") as BufferAttribute;
    const progress = shown.current;
    for (let i = 0; i < n; i++) {
      const j = i * 3;
      const q = progress * 4 - order[i] * 2;
      // Raw particles tumble with their speed; cleaned and modeled ones settle their spin.
      const speed = Math.hypot(vel[j], vel[j + 1]);
      tmp.q.set(rot[i * 4], rot[i * 4 + 1], rot[i * 4 + 2], rot[i * 4 + 3]);
      const spinRate = q < 1 ? 0.4 + speed * 0.6 : 0.15;
      tmp.axis.set(spin[j], spin[j + 1], spin[j + 2]).normalize();
      tmp.dq.setFromAxisAngle(tmp.axis, spinRate * (1 / 60));
      tmp.q.multiply(tmp.dq);
      rot[i * 4] = tmp.q.x;
      rot[i * 4 + 1] = tmp.q.y;
      rot[i * 4 + 2] = tmp.q.z;
      rot[i * 4 + 3] = tmp.q.w;
      tmp.o.position.set(pos[j], pos[j + 1], pos[j + 2]);
      tmp.o.quaternion.copy(tmp.q);
      tmp.o.scale.setScalar(radius * (q >= 2 ? 0.9 : 1));
      tmp.o.updateMatrix();
      m.setMatrixAt(i, tmp.o.matrix);
      const c = q < 1 ? BRONZE : q < 2 ? SILVER : GOLD;
      tmp.c.copy(c);
      m.setColorAt(i, tmp.c);
      hp.setXYZ(i, pos[j], pos[j + 1], pos[j + 2] + radius);
      const k = glow[i];
      // A soft gold aura with normal blending, so the glow reads on white and on black pages.
      hc.setXYZW(i, GOLD.r, GOLD.g, GOLD.b * 0.8, k * 0.32);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    hp.needsUpdate = true;
    hc.needsUpdate = true;
  };

  // Poster: run the physics forward to a settled frame where all three stages are visible.
  // Re-warm whenever the layout (and so the simulation) is rebuilt, e.g. after a resize.
  const warmed = useRef<typeof sim | null>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    if (warmed.current !== sim) {
      warmed.current = sim;
      const steps = slot.poster ? 900 : 120;
      for (let s = 0; s < steps; s++) step(shown.current);
    }
    if (slot.poster) return write();
    if (!slot.active) return;
    // The opening moment: the stream advances on its own to INTRO_PROGRESS over about 1.2 s, then scroll takes over.
    intro.current = Math.min(1, intro.current + delta / 1.2);
    const goal = Math.max(INTRO_PROGRESS * easeOut(intro.current), INTRO_PROGRESS + (1 - INTRO_PROGRESS) * (slot.progress?.current ?? 0));
    shown.current += (goal - shown.current) * Math.min(1, delta * 4);
    acc.current = Math.min(acc.current + delta, STEP * 6);
    while (acc.current >= STEP) {
      step(shown.current);
      acc.current -= STEP;
    }
    write();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, CAMERA_Z]} fov={FOV} near={1} far={40} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} />
      <instancedMesh ref={mesh} args={[geometry, material, n]} frustumCulled={false} />
      <points ref={halo} geometry={haloGeo} material={haloMat} frustumCulled={false} />
    </>
  );
}

function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
