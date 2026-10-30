"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { BoxGeometry, Color, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import { loadStudioEnv } from "../env";
import { loadMaps } from "../ktx";
import { useSceneReady } from "../useSceneReady";
import type { SceneProps } from ".";

// DevHacks × Cubbie, Receipts (runbook V1.5): 493 tiles, one per automated test in
// Receipts' CI (portfolio-facts 2.2), topple in a domino wave. Each tile is an inverted
// pendulum (θ'' = (g / L)·sin θ) that starts falling when the tile before it leans far
// enough to touch it, and comes to rest leaning on the next tile; the last tile in a row
// lies flat. The rows branch off a first column (each row's first tile is pushed by the
// row before), so the front runs diagonally across the field in a few seconds. After a
// pause the tiles stand back up and the wave runs again.

const COLS = 29;
const ROWS = 17; // 29 × 17 = 493
const COUNT = COLS * ROWS;
const H = 0.16; // tile height (m)
const GAP = 0.085; // spacing along a row
const TOUCH = Math.asin(Math.min(1, (GAP - 0.012) / H)); // lean at which a tile reaches the next one
const REST = Math.asin(Math.min(1, (GAP - 0.012) / H)) + 0.05; // resting lean on the next tile
const G = 9.82;
const POSTER_TIME = 2.6; // the diagonal front about halfway across
const ACCENT = new Color("#1D4ED8");

export default function Receipts({ slot }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const [mat, setMat] = useState<MeshStandardMaterial | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([loadMaps(gl, "paper", ["color", "normal", "orm"]), loadStudioEnv(gl)])
      .then(([paper]) => alive && setMat(new MeshStandardMaterial({ ...paper, roughness: 1 })))
      .catch(() => undefined); // failure already switched the page to posters (failStage)
    return () => {
      alive = false;
    };
  }, [gl]);
  useEffect(() => () => mat?.dispose(), [mat]);
  useSceneReady(slot, mat !== null);

  const geo = useMemo(() => new BoxGeometry(0.06, H, 0.012).translate(0, H / 2, 0), []);
  useEffect(() => () => geo.dispose(), [geo]);

  // Row-major order; every row runs the same way.
  const sim = useMemo(() => {
    const order: { x: number; z: number; dir: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) order.push({ x: (c - (COLS - 1) / 2) * GAP, z: (r - (ROWS - 1) / 2) * 0.17, dir: 1 });
    }
    return { order, theta: new Float32Array(COUNT), omega: new Float32Array(COUNT), started: new Uint8Array(COUNT), time: 0, doneAt: -1 };
  }, []);

  const reset = () => {
    sim.theta.fill(0);
    sim.omega.fill(0);
    sim.started.fill(0);
    sim.started[0] = 1;
    sim.omega[0] = 1.2; // the first push
    sim.doneAt = -1;
  };

  const step = (dt: number) => {
    sim.time += dt;
    const { theta, omega, started } = sim;
    let allDown = true;
    for (let i = 0; i < COUNT; i++) {
      if (!started[i]) {
        allDown = false;
        continue;
      }
      // Row ends: the last tile of a row falls flat; mid-row tiles rest on the next one.
      const last = i === COUNT - 1 || (i + 1) % COLS === 0;
      const stop = last ? Math.PI / 2 : REST;
      if (theta[i] < stop) {
        omega[i] += (G / (H * 0.66)) * Math.sin(Math.max(theta[i], 0.02)) * dt;
        omega[i] *= 0.995;
        theta[i] = Math.min(stop, theta[i] + omega[i] * dt);
        if (theta[i] >= stop) omega[i] = 0;
        allDown = false;
      }
      // Along the row: the next tile, once this one touches it.
      if (!last && !started[i + 1] && theta[i] >= TOUCH) {
        started[i + 1] = 1;
        omega[i + 1] = Math.max(0.6, omega[i] * 0.55);
      }
      // Down the first column: a row's first tile also tips the next row's first tile.
      const below = i + COLS;
      if (i % COLS === 0 && below < COUNT && !started[below] && theta[i] >= TOUCH) {
        started[below] = 1;
        omega[below] = Math.max(0.6, omega[i] * 0.55);
      }
    }
    if (allDown && sim.doneAt < 0) sim.doneAt = sim.time;
    if (sim.doneAt >= 0 && sim.time - sim.doneAt > 1.8) reset();
  };

  const mesh = useRef<InstancedMesh>(null);
  const o = useMemo(() => new Object3D(), []);
  const accent = useMemo(() => new Color(), []);
  const write = () => {
    const m = mesh.current;
    if (!m) return;
    sim.order.forEach((t, i) => {
      o.position.set(t.x, 0, t.z);
      o.rotation.set(0, Math.PI / 2, -sim.theta[i] * t.dir);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      // A tile is tinted in the accent while it falls, white once it rests: the wave front reads in colour.
      const moving = sim.started[i] && sim.omega[i] > 0.05 ? 1 : 0;
      accent.set("#ffffff").lerp(ACCENT, moving * 0.85);
      m.setColorAt(i, accent);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };

  const warmed = useRef(false);
  useFrame((_, delta) => {
    if (!mat) return;
    if (!warmed.current) {
      warmed.current = true;
      reset();
      if (slot.poster) for (let t = 0; t < POSTER_TIME; t += 1 / 120) step(1 / 120);
    }
    if (!slot.poster && slot.active) {
      const dt = Math.min(delta, 0.05);
      for (let k = 0; k < 2; k++) step(dt / 2);
    }
    write();
  });

  if (!mat) return null;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.9, 2.3, 3.0]} fov={34} near={0.3} far={20} onUpdate={(c) => c.lookAt(0, 0, 0)} />
      <directionalLight position={[2.5, 5, 2]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} shadow-normalBias={0.015} shadow-camera-left={-1.8} shadow-camera-right={1.8} shadow-camera-top={1.8} shadow-camera-bottom={-1.8} />
      <instancedMesh ref={mesh} args={[geo, mat, COUNT]} castShadow receiveShadow frustumCulled={false} />
      <ContactShadows position={[0, 0.001, 0]} scale={[3.5, 3.5]} far={0.4} blur={1.8} opacity={0.4} resolution={512} />
    </>
  );
}
