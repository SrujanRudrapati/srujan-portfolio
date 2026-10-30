"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { Body, Box, Cylinder, Vec3 } from "cannon-es";
import { AdditiveBlending, BoxGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, LatheGeometry, MeshPhysicalMaterial, MeshStandardMaterial, SRGBColorSpace, Vector2, type Group } from "three";
import { loadStudioEnv } from "../env";
import { loadMaps, type MaterialMaps } from "../ktx";
import { FIXED_STEP, MAX_SUBSTEPS, groundPlane, makeWorld, staticBox, sync } from "../physics";
import { useSceneReady } from "../useSceneReady";
import type { SceneProps } from ".";

// Label Lens (runbook V1.5): a medicine bottle turns, a scan line passes, and the
// words a warning would quote peel off the label and stack into a warning column.
// The label text is a generic prop (no product, no brand); it stands for the app's
// rule that every warning quotes the label word for word (portfolio-facts 2.3).
// Words leave as rigid bodies: an outward peel impulse, a guiding force over to the
// column, then gravity and collisions stack them.

const BOTTLE_R = 0.3;
const LABEL = { r: 0.306, y0: 0.16, y1: 0.66, thetaLength: Math.PI * 1.7 };
const LABEL_START = -LABEL.thetaLength / 2; // label centred on the front; its seam is at the back
const COLUMN = { x: 0.98, halfW: 0.25, halfD: 0.075, height: 0.62 };
const BRICK = { hx: 0.22, hy: 0.05, hz: 0.05 };
const SCAN = { top: 0.7, bottom: 0.12, period: 2.8 };
const SPIN = 0.55; // rad/s
const POSTER_TIME = 60; // upper bound for the poster run
const ACCENT = new Color("#1D4ED8");

const LINES: { text: string; flag?: string }[] = [
  { text: "Take one tablet by mouth with water." },
  { text: "Contains lactose.", flag: "lactose" },
  { text: "May cause drowsiness.", flag: "drowsiness" },
  { text: "Avoid alcohol while taking.", flag: "alcohol" },
  { text: "Do not take with grapefruit juice.", flag: "grapefruit" },
  { text: "Keep out of reach of children." },
];

type Word = { word: string; u: number; v: number; uw: number; vh: number };
type Brick = { word: Word; body: Body; alive: boolean; scale: number; bornAt: number; guided: boolean; texture: CanvasTexture };

const CW = 2048;
const CH = 640;

/** Draws the printed label; peeled words leave a pale patch. Returns where each flagged word sits (UV). */
function drawLabel(ctx: CanvasRenderingContext2D, font: string, peeled: Set<string>): Word[] {
  ctx.fillStyle = "#f7f6f2";
  ctx.fillRect(0, 0, CW, CH);
  const x0 = CW * 0.355;
  ctx.fillStyle = "#101010";
  ctx.font = `700 72px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Rx", x0, 86);
  ctx.fillRect(x0, 104, CW * 0.3, 4);
  ctx.font = `500 44px ${font}`;
  const words: Word[] = [];
  LINES.forEach((line, i) => {
    const y = 170 + i * 66;
    let x = x0;
    for (const part of line.text.split(/(\s+)/)) {
      const w = ctx.measureText(part).width;
      const bare = part.replace(/[.,]/g, "");
      if (line.flag && bare === line.flag) {
        words.push({ word: line.flag, u: (x + w / 2) / CW, v: 1 - (y - 13) / CH, uw: w / CW, vh: 50 / CH });
        if (peeled.has(line.flag)) {
          ctx.fillStyle = "#e9e6dc";
          ctx.fillRect(x - 4, y - 40, w + 8, 52);
          ctx.fillStyle = "#101010";
          x += w;
          continue;
        }
      }
      ctx.fillText(part, x, y);
      x += w;
    }
  });
  // A printed barcode block (decorative, no data).
  for (let i = 0; i < 70; i++) {
    const w = (i * 37) % 5 === 0 ? 6 : 3;
    ctx.fillRect(x0 + i * 9, CH - 110, w, 70);
  }
  return words;
}

function brickTexture(word: string, font: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 116;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f7f6f2";
  ctx.fillRect(0, 0, 512, 116);
  ctx.fillStyle = "#101010";
  ctx.font = `600 64px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(word, 256, 62);
  ctx.fillStyle = "#1D4ED8";
  ctx.fillRect(0, 0, 10, 116);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function bottleGeometry() {
  const pts: Vector2[] = [];
  pts.push(new Vector2(0, 0), new Vector2(BOTTLE_R - 0.03, 0), new Vector2(BOTTLE_R - 0.005, 0.01), new Vector2(BOTTLE_R, 0.035));
  pts.push(new Vector2(BOTTLE_R, 0.74));
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new Vector2(0.18 + (BOTTLE_R - 0.18) * Math.cos(a), 0.74 + 0.12 * Math.sin(a)));
  }
  pts.push(new Vector2(0.17, 0.88), new Vector2(0.17, 0.96), new Vector2(0.185, 0.97), new Vector2(0.185, 0.99), new Vector2(0, 0.99));
  return new LatheGeometry(pts, 72);
}

type Mats = { glass: MeshPhysicalMaterial; cap: MeshStandardMaterial; label: MeshStandardMaterial; paper: MeshStandardMaterial; acrylic: MeshPhysicalMaterial; aluminium: MeshStandardMaterial; scan: MeshStandardMaterial; band: MeshStandardMaterial };

function makeMats(paper: MaterialMaps, plastic: MaterialMaps, aluminium: MaterialMaps, labelTex: CanvasTexture): Mats {
  return {
    glass: new MeshPhysicalMaterial({ color: "#b8682a", roughness: 0.08, transmission: 0.92, thickness: 0.5, ior: 1.52, attenuationColor: new Color("#7a3a0c"), attenuationDistance: 0.35, clearcoat: 1, clearcoatRoughness: 0.05 }),
    cap: new MeshStandardMaterial({ ...plastic, color: "#f2f2ef", roughness: 0.55 }),
    label: new MeshStandardMaterial({ map: labelTex, normalMap: paper.normalMap, roughnessMap: paper.roughnessMap, normalScale: new Vector2(0.4, 0.4), side: DoubleSide }),
    paper: new MeshStandardMaterial({ ...paper, roughness: 1 }),
    acrylic: new MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.03, metalness: 0, transparent: true, opacity: 0.07, envMapIntensity: 0.8, clearcoat: 1, depthWrite: false }),
    aluminium: new MeshStandardMaterial({ roughnessMap: aluminium.roughnessMap, metalness: 0.75, roughness: 0.4, color: "#d4d8dc", envMapIntensity: 1.6 }),
    scan: new MeshStandardMaterial({ color: "#0b1330", emissive: ACCENT, emissiveIntensity: 4 }),
    band: new MeshStandardMaterial({ color: "#000000", emissive: ACCENT, emissiveIntensity: 1.2, transparent: true, opacity: 0.22, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
  };
}

export default function LabelLens({ slot }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const font = useMemo(() => getComputedStyle(slot.el).fontFamily || "sans-serif", [slot.el]);
  const label = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = CW;
    c.height = CH;
    const ctx = c.getContext("2d")!;
    const peeled = new Set<string>();
    const words = drawLabel(ctx, font, peeled);
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 8;
    const redraw = () => {
      drawLabel(ctx, font, peeled);
      tex.needsUpdate = true;
    };
    return { words, peeled, tex, redraw };
  }, [font]);
  useEffect(() => () => label.tex.dispose(), [label]);

  const [mats, setMats] = useState<Mats | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([loadMaps(gl, "paper", ["color", "normal", "orm"]), loadMaps(gl, "plastic", ["normal", "orm"], 3), loadMaps(gl, "aluminium", ["orm"], 2), loadStudioEnv(gl)]).then(
      ([paper, plastic, aluminium]) => alive && setMats(makeMats(paper, plastic, aluminium, label.tex)),
    ).catch(() => undefined); // failure already switched the page to posters (failStage)
    return () => {
      alive = false;
    };
  }, [gl, label.tex]);
  useEffect(() => () => {
    if (mats) Object.values(mats).forEach((m) => m.dispose());
  }, [mats]);
  useSceneReady(slot, mats !== null);

  const geo = useMemo(() => ({ bottle: bottleGeometry(), label: new CylinderGeometry(LABEL.r, LABEL.r, LABEL.y1 - LABEL.y0, 96, 1, true, LABEL_START, LABEL.thetaLength), brick: new BoxGeometry(BRICK.hx * 2, BRICK.hy * 2, BRICK.hz * 2) }), []);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const sim = useMemo(() => {
    const { world, mats: pm } = makeWorld();
    groundPlane(world, pm.ground);
    const bottle = new Body({ mass: 0, material: pm.ground, shape: new Cylinder(BOTTLE_R, BOTTLE_R, 1, 24), position: new Vec3(0, 0.5, 0) });
    world.addBody(bottle);
    const { x, halfW, halfD, height } = COLUMN;
    staticBox(world, pm.ground, [halfW + 0.02, height / 2, 0.006], [x, height / 2, -halfD - 0.006]);
    staticBox(world, pm.ground, [halfW + 0.02, height / 2, 0.006], [x, height / 2, halfD + 0.006]);
    staticBox(world, pm.ground, [0.006, height / 2, halfD], [x - halfW - 0.006, height / 2, 0]);
    staticBox(world, pm.ground, [0.006, height / 2, halfD], [x + halfW + 0.006, height / 2, 0]);
    staticBox(world, pm.wood, [halfW + 0.03, 0.01, halfD + 0.03], [x, 0.01, 0]);
    const bricks: Brick[] = label.words.map((w) => {
      const body = new Body({ mass: 0.15, material: pm.item, shape: new Box(new Vec3(BRICK.hx, BRICK.hy, BRICK.hz)), angularDamping: 0.3, allowSleep: true, sleepSpeedLimit: 0.05 });
      // No linearDamping: with it, a flat brick dropped from rest sank through the base in cannon-es 0.20 (reproduced in isolation).
      body.angularFactor.set(0, 0, 1); // stays facing the camera; tips and settles in its own plane
      return { word: w, body, alive: false, scale: 0, bornAt: 0, guided: false, texture: brickTexture(w.word, font) };
    });
    // Guide each peeled word to a point above the column, level it (a critically damped
    // spring on its in-plane angle), and drop it once the word below has landed. One at a time,
    // so the column stacks instead of jamming.
    const I = (0.15 / 12) * ((BRICK.hx * 2) ** 2 + (BRICK.hy * 2) ** 2);
    const OMEGA = 9;
    world.addEventListener("preStep", () => {
      const falling = bricks.some((b) => b.alive && !b.guided && b.body.velocity.length() > 0.08);
      for (const b of bricks) {
        if (!b.alive || !b.guided) continue;
        b.body.wakeUp(); // a hovering body would otherwise sleep and ignore the guide
        const p = b.body.position;
        const v = b.body.velocity;
        const m = b.body.mass;
        const hoverY = COLUMN.height + 0.2;
        const fx = m * (16 * (COLUMN.x - p.x) - 8 * v.x);
        const fz = m * (30 * (0 - p.z) - 11 * v.z);
        const fy = m * (9.82 + 16 * (hoverY - p.y) - 8 * v.y);
        b.body.applyForce(new Vec3(fx, fy, fz)); // at the centre of mass
        const angle = 2 * Math.asin(Math.max(-1, Math.min(1, b.body.quaternion.z * Math.sign(b.body.quaternion.w || 1))));
        b.body.torque.z += -I * (OMEGA * OMEGA * angle + 2 * OMEGA * b.body.angularVelocity.z);
        const settled = Math.abs(COLUMN.x - p.x) < 0.02 && Math.abs(p.z) < 0.015 && Math.abs(angle) < 0.04 && v.length() < 0.1;
        if (settled && !falling) {
          b.guided = false;
          b.body.angularVelocity.set(0, 0, 0);
          break;
        }
      }
    });
    return { world, bricks, time: 0, spin: 0, scanY: SCAN.top, holdUntil: 0, resetAt: -1 };
  }, [label.words, font]);
  useEffect(() => () => sim.bricks.forEach((b) => b.texture.dispose()), [sim]);

  const bottleGroup = useRef<Group>(null);
  const brickGroups = useRef<(Group | null)[]>([]);
  const scanGroup = useRef<Group>(null);

  const peel = (b: Brick) => {
    const { u, v } = b.word;
    const theta = LABEL_START + u * LABEL.thetaLength + sim.spin;
    const y = LABEL.y0 + v * (LABEL.y1 - LABEL.y0);
    const r = BOTTLE_R + BRICK.hz + 0.03;
    b.body.position.set(Math.sin(theta) * r, y, Math.cos(theta) * r);
    b.body.quaternion.setFromEuler(0, 0, 0);
    b.body.velocity.set(0.3, 0.6, 0.9);
    b.body.angularVelocity.set(0, 0, -2.5);
    sim.world.addBody(b.body);
    b.body.wakeUp();
    b.alive = true;
    b.guided = true;
    b.bornAt = sim.time;
    label.peeled.add(b.word.word);
    label.redraw();
  };

  const advance = (dt: number) => {
    const s = sim;
    s.time += dt;
    s.spin += SPIN * dt;
    if (s.resetAt < 0) {
      s.scanY -= ((SCAN.top - SCAN.bottom) / SCAN.period) * dt;
      if (s.scanY < SCAN.bottom) s.scanY = SCAN.top;
      // One word in flight at a time: the next peels on a later pass once the column is still.
      const busy = s.bricks.some((b) => b.alive && b.guided);
      for (const b of s.bricks) {
        if (busy) break;
        if (b.alive || label.peeled.has(b.word.word)) continue;
        const y = LABEL.y0 + b.word.v * (LABEL.y1 - LABEL.y0);
        const facing = Math.cos(LABEL_START + b.word.u * LABEL.thetaLength + s.spin);
        if (Math.abs(s.scanY - y) < 0.02 && facing > 0.3) peel(b);
      }
      if (s.bricks.every((b) => b.alive)) {
        const last = Math.max(...s.bricks.map((b) => b.bornAt));
        if (s.time - last > 4.5) s.resetAt = s.time;
      }
    }
    for (const b of s.bricks) {
      const target = b.alive && s.resetAt < 0 ? 1 : 0;
      b.scale += (target - b.scale) * Math.min(1, dt * 12);
      if (b.alive && s.resetAt >= 0 && b.scale < 0.02) {
        s.world.removeBody(b.body);
        b.alive = false;
      }
    }
    if (s.resetAt >= 0 && s.bricks.every((b) => !b.alive)) {
      s.resetAt = -1;
      s.scanY = SCAN.top;
      label.peeled.clear();
      label.redraw();
    }
    s.world.step(FIXED_STEP, dt, MAX_SUBSTEPS);
  };

  const warmed = useRef(false);
  useFrame((_, delta) => {
    if (!mats) return;
    if (!warmed.current) {
      warmed.current = true;
      if (slot.poster) {
        // Run until three words are stacked and still (deterministic, so the same frame every time).
        const stacked = () => sim.bricks.filter((b) => b.alive && !b.guided && b.body.position.y < COLUMN.height && b.body.velocity.length() < 0.02).length >= 3;
        for (let t = 0; t < POSTER_TIME && !stacked(); t += FIXED_STEP) advance(FIXED_STEP);
        sim.spin = Math.round(sim.spin / (2 * Math.PI)) * 2 * Math.PI + 0.25; // face the label to the camera
      }
    }
    if (!slot.poster && slot.active) advance(Math.min(delta, 0.05));
    if (bottleGroup.current) bottleGroup.current.rotation.y = sim.spin;
    if (scanGroup.current) scanGroup.current.position.y = sim.scanY;
    sim.bricks.forEach((b, i) => {
      const g = brickGroups.current[i];
      if (!g) return;
      g.visible = b.scale > 0.01;
      sync(g, b.body);
      g.scale.setScalar(Math.max(0.001, b.scale));
    });
  });

  const brickMaterials = useMemo(() => (mats ? sim.bricks.map((b) => { const front = new MeshStandardMaterial({ map: b.texture, normalMap: mats.paper.normalMap, roughness: 0.95 }); return [mats.paper, mats.paper, mats.paper, mats.paper, front, mats.paper]; }) : []), [mats, sim]);
  useEffect(() => () => brickMaterials.forEach((arr) => arr[4].dispose()), [brickMaterials]);

  if (!mats) return null;
  const { x, halfW, halfD, height } = COLUMN;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.55, 0.95, 3.2]} fov={26} near={0.5} far={20} onUpdate={(c) => c.lookAt(0.48, 0.46, 0)} />
      <directionalLight position={[-2, 4, 3]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-1.6} shadow-camera-right={1.8} shadow-camera-top={1.6} shadow-camera-bottom={-0.4} />
      <group ref={bottleGroup}>
        <mesh geometry={geo.bottle} material={mats.glass} castShadow />
        <mesh geometry={geo.label} material={mats.label} position={[0, (LABEL.y0 + LABEL.y1) / 2, 0]} />
        <mesh position={[0, 1.06, 0]} material={mats.cap} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.16, 64]} />
        </mesh>
        <mesh position={[0, 1.145, 0]} material={mats.cap}>
          <cylinderGeometry args={[0.19, 0.2, 0.012, 64]} />
        </mesh>
      </group>
      <group ref={scanGroup}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.scan}>
          <torusGeometry args={[BOTTLE_R + 0.035, 0.004, 8, 96]} />
        </mesh>
        <mesh material={mats.band}>
          <cylinderGeometry args={[BOTTLE_R + 0.03, BOTTLE_R + 0.03, 0.05, 96, 1, true]} />
        </mesh>
      </group>
      {/* The warning column: an acrylic chute on an aluminium base. */}
      <group position={[x, 0, 0]}>
        <mesh position={[0, height / 2, -halfD - 0.006]} material={mats.acrylic}>
          <boxGeometry args={[halfW * 2 + 0.04, height, 0.012]} />
        </mesh>
        <mesh position={[0, height / 2, halfD + 0.006]} material={mats.acrylic}>
          <boxGeometry args={[halfW * 2 + 0.04, height, 0.012]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (halfW + 0.006), height / 2, 0]} material={mats.aluminium} castShadow>
            <boxGeometry args={[0.012, height, halfD * 2 + 0.024]} />
          </mesh>
        ))}
        <mesh position={[0, 0.01, 0]} material={mats.aluminium} castShadow receiveShadow>
          <boxGeometry args={[halfW * 2 + 0.06, 0.02, halfD * 2 + 0.06]} />
        </mesh>
      </group>
      {sim.bricks.map((b, i) => (
        <group
          key={b.word.word}
          ref={(g) => {
            brickGroups.current[i] = g;
          }}
          visible={false}
        >
          <mesh geometry={geo.brick} material={brickMaterials[i]} castShadow receiveShadow />
        </group>
      ))}
      <ContactShadows position={[0.4, 0.002, 0]} scale={[5, 3]} far={0.8} blur={2.4} opacity={0.42} resolution={512} />
    </>
  );
}
