"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { Color, CylinderGeometry, InstancedMesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, type Group } from "three";
import { loadStudioEnv } from "../env";
import { loadMaps, type MaterialMaps } from "../ktx";
import { FIXED_STEP, sync } from "../physics";
import { BED_TOP, PALLET, ROLLER_R, UNIT_HALF_X, UNIT_TOP, UNIT_X, X0, X1, createSurplusSim, type Item } from "./surplus-sim";
import { useSceneReady } from "../useSceneReady";
import type { SceneProps } from ".";

// Surplus AI (runbook V1.5): jumbled boxes and electronics ride a powered roller
// conveyor through four compact aluminium compute units, come out aligned, and
// drop onto a wooden pallet where they collide and settle. Click to flick one.
// Everything moves by force: the rollers drive items through friction-limited
// traction, each unit applies a centring force and a yaw-aligning torque, and
// gravity does the rest. Items are generic: no logos, no brands.

const POSTER_TIME = 13.5;
const ACCENT = new Color("#1D4ED8");

type Mats = { cardboard: MeshStandardMaterial; aluminium: MeshStandardMaterial; wood: MeshStandardMaterial; plastic: MeshStandardMaterial; darkPlastic: MeshStandardMaterial; tape: MeshStandardMaterial; glass: MeshPhysicalMaterial; led: MeshStandardMaterial[] };

function makeMaterials(m: { cardboard: MaterialMaps; aluminium: MaterialMaps; wood: MaterialMaps; plastic: MaterialMaps }): Mats {
  return {
    cardboard: new MeshStandardMaterial({ ...m.cardboard, roughness: 1 }),
    // Bead-blasted aluminium: the scan's roughness gives variation; its circular-brush normal map read as cracks at this size.
    aluminium: new MeshStandardMaterial({ roughnessMap: m.aluminium.roughnessMap, metalness: 0.75, roughness: 0.4, color: "#d4d8dc", envMapIntensity: 1.6 }),
    wood: new MeshStandardMaterial({ ...m.wood, roughness: 1, color: "#e9d9bf" }),
    plastic: new MeshStandardMaterial({ ...m.plastic, roughness: 0.8, color: "#f1f1ee" }),
    darkPlastic: new MeshStandardMaterial({ normalMap: m.plastic.normalMap, roughness: 0.55, color: "#26282b" }),
    tape: new MeshStandardMaterial({ color: "#c7a06a", roughness: 0.35, transparent: true, opacity: 0.85 }),
    glass: new MeshPhysicalMaterial({ color: "#0b0c0e", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, metalness: 0.2 }),
    led: UNIT_X.map(() => new MeshStandardMaterial({ color: "#0d1530", emissive: ACCENT, emissiveIntensity: 0 })),
  };
}

function ItemMesh({ item, mats }: { item: Item; mats: Mats }) {
  const [hx, hy, hz] = item.half;
  const w = hx * 2, h = hy * 2, d = hz * 2;
  switch (item.kind) {
    case "box":
      return (
        <>
          <RoundedBox args={[w, h, d]} radius={0.006} smoothness={2} material={mats.cardboard} castShadow receiveShadow />
          <mesh position={[0, hy + 0.0008, 0]} material={mats.tape}>
            <boxGeometry args={[w * 1.002, 0.0015, d * 0.22]} />
          </mesh>
        </>
      );
    case "laptop":
      return (
        <>
          <RoundedBox args={[w, h, d]} radius={0.008} smoothness={3} material={mats.aluminium} castShadow receiveShadow />
          <mesh position={[0, 0, hz + 0.0005]} material={mats.darkPlastic}>
            <boxGeometry args={[w * 0.9, 0.002, 0.002]} />
          </mesh>
        </>
      );
    case "tablet":
      return (
        <>
          <RoundedBox args={[w, h, d]} radius={0.004} smoothness={3} material={mats.aluminium} castShadow />
          <mesh position={[0, hy + 0.0004, 0]} material={mats.glass}>
            <boxGeometry args={[w * 0.98, 0.001, d * 0.97]} />
          </mesh>
        </>
      );
    case "router":
      return (
        <>
          <RoundedBox args={[w, h, d]} radius={0.01} smoothness={3} material={mats.plastic} castShadow receiveShadow />
          {[-0.7, 0.7].map((s) => (
            <mesh key={s} position={[s * hx * 0.9, hy + 0.05, -hz * 0.85]} material={mats.darkPlastic} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
            </mesh>
          ))}
        </>
      );
    case "keyboard":
      return (
        <>
          <RoundedBox args={[w, h, d]} radius={0.006} smoothness={2} material={mats.darkPlastic} castShadow receiveShadow />
          {Array.from({ length: 3 }, (_, r) =>
            Array.from({ length: 12 }, (_, c) => (
              <mesh key={`${r}-${c}`} position={[-hx + 0.03 + c * ((w - 0.06) / 11), hy + 0.003, -hz + 0.025 + r * ((d - 0.05) / 2)]} material={mats.plastic}>
                <boxGeometry args={[0.022, 0.005, 0.022]} />
              </mesh>
            )),
          )}
        </>
      );
    default:
      return <RoundedBox args={[w, h, d]} radius={0.008} smoothness={2} material={mats.darkPlastic} castShadow receiveShadow />;
  }
}

function Pallet({ mats }: { mats: Mats }) {
  const boards = [-0.34, -0.17, 0, 0.17, 0.34];
  const blocks: [number, number][] = [];
  for (const x of [-0.42, 0, 0.42]) for (const z of [-0.33, 0, 0.33]) blocks.push([x, z]);
  return (
    <group position={[PALLET.x, 0, 0]}>
      {boards.map((z) => (
        <mesh key={z} position={[0, PALLET.top - 0.011, z]} material={mats.wood} castShadow receiveShadow>
          <boxGeometry args={[PALLET.hx * 2, 0.022, 0.12]} />
        </mesh>
      ))}
      {[-0.33, 0, 0.33].map((z) => (
        <mesh key={`s${z}`} position={[0, 0.11, z]} material={mats.wood} castShadow receiveShadow>
          <boxGeometry args={[PALLET.hx * 2, 0.022, 0.1]} />
        </mesh>
      ))}
      {blocks.map(([x, z]) => (
        <mesh key={`b${x}${z}`} position={[x, 0.05, z]} material={mats.wood} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.078, 0.1]} />
        </mesh>
      ))}
      {[-0.33, 0, 0.33].map((z) => (
        <mesh key={`f${z}`} position={[0, 0.006, z]} material={mats.wood} receiveShadow>
          <boxGeometry args={[PALLET.hx * 2, 0.012, 0.1]} />
        </mesh>
      ))}
    </group>
  );
}

function Rollers({ mats, spin }: { mats: Mats; spin: { spin: number } }) {
  const ref = useRef<InstancedMesh>(null);
  const count = Math.floor((X1 - X0) / 0.105);
  const geo = useMemo(() => new CylinderGeometry(ROLLER_R, ROLLER_R, 0.56, 20), []);
  const o = useMemo(() => new Object3D(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      o.position.set(X0 + 0.05 + i * 0.105, BED_TOP - ROLLER_R, 0);
      o.rotation.set(Math.PI / 2, 0, -spin.spin);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  useEffect(() => () => geo.dispose(), [geo]);
  return <instancedMesh ref={ref} args={[geo, mats.aluminium, count]} castShadow receiveShadow />;
}

export default function SurplusLine({ slot }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const [mats, setMats] = useState<Mats | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([
      loadMaps(gl, "cardboard", ["color", "normal", "orm"]),
      loadMaps(gl, "aluminium", ["orm"], 2),
      loadMaps(gl, "wood", ["color", "normal", "orm"]),
      loadMaps(gl, "plastic", ["normal", "orm"]),
      loadStudioEnv(gl),
    ]).then(([cardboard, aluminium, wood, plastic]) => alive && setMats(makeMaterials({ cardboard, aluminium, wood, plastic })))
      .catch(() => undefined); // failure already switched the page to posters (failStage)
    return () => {
      alive = false;
    };
  }, [gl]);
  useEffect(() => () => {
    if (mats) Object.values(mats).flat().forEach((m) => m.dispose());
  }, [mats]);
  useSceneReady(slot, mats !== null);

  // Physics lives in surplus-sim.ts (tested in Node); this component draws it. Seeded so posters match.
  const sim = useMemo(() => createSurplusSim(11), []);

  const groups = useRef<(Group | null)[]>([]);
  // Hovering an item sets a pointer cursor on the page; never leave it behind on unmount.
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  const warmed = useRef(false);
  const ledLevel = useRef(UNIT_X.map(() => 0));
  useFrame((_, delta) => {
    if (!mats) return;
    if (!warmed.current) {
      warmed.current = true;
      if (slot.poster) for (let t = 0; t < POSTER_TIME; t += FIXED_STEP) sim.advance(FIXED_STEP);
    }
    if (!slot.poster && slot.active) sim.advance(Math.min(delta, 0.05));
    sim.items.forEach((it, i) => {
      const g = groups.current[i];
      if (!g) return;
      g.visible = it.scale > 0.01;
      sync(g, it.body);
      g.scale.setScalar(Math.max(0.001, it.scale));
    });
    // A unit's status strip lights while something is inside it.
    UNIT_X.forEach((x, u) => {
      const busy = sim.items.some((it) => it.alive && Math.abs(it.body.position.x - x) < UNIT_HALF_X && it.body.position.y < BED_TOP + UNIT_TOP);
      ledLevel.current[u] += ((busy ? 3.2 : 0.25) - ledLevel.current[u]) * Math.min(1, delta * 8);
      mats.led[u].emissiveIntensity = slot.poster ? (u % 2 ? 3 : 0.25) : ledLevel.current[u];
    });
  });

  const flick = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    sim.flick(i);
  };

  if (!mats) return null;
  const bedLen = X1 - X0;
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.9, 2.1, 5.4]} fov={30} near={0.5} far={30} onUpdate={(c) => c.lookAt(0.2, 0.5, 0)} />
      <directionalLight
        position={[2.5, 6, 3.5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3.4}
        shadow-camera-right={3.4}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-2.2}
        shadow-camera-near={1}
        shadow-camera-far={14}
      />
      {/* Conveyor frame: side channels and legs. */}
      {[-0.31, 0.31].map((z) => (
        <mesh key={z} position={[(X0 + X1) / 2, BED_TOP - 0.03, z]} material={mats.aluminium} castShadow receiveShadow>
          <boxGeometry args={[bedLen, 0.1, 0.03]} />
        </mesh>
      ))}
      {[X0 + 0.1, (X0 + X1) / 2, X1 - 0.3].flatMap((x) =>
        [-0.29, 0.29].map((z) => (
          <mesh key={`${x}${z}`} position={[x, (BED_TOP - 0.08) / 2, z]} material={mats.aluminium} castShadow>
            <boxGeometry args={[0.04, BED_TOP - 0.08, 0.04]} />
          </mesh>
        )),
      )}
      <Rollers mats={mats} spin={sim.state} />
      {/* Compute units: brushed aluminium arches with a status strip. */}
      {UNIT_X.map((x, u) => (
        <group key={x} position={[x, 0, 0]}>
          <RoundedBox args={[UNIT_HALF_X * 2, 0.12, 0.7]} radius={0.02} smoothness={4} position={[0, BED_TOP + UNIT_TOP, 0]} material={mats.aluminium} castShadow receiveShadow />
          {[-0.34, 0.34].map((z) => (
            <RoundedBox key={z} args={[UNIT_HALF_X * 2, UNIT_TOP - 0.02, 0.035]} radius={0.012} smoothness={3} position={[0, BED_TOP + (UNIT_TOP - 0.02) / 2, z]} material={mats.aluminium} castShadow receiveShadow />
          ))}
          <mesh position={[0, BED_TOP + UNIT_TOP, 0.351]} material={mats.led[u]}>
            <boxGeometry args={[UNIT_HALF_X * 1.3, 0.012, 0.002]} />
          </mesh>
        </group>
      ))}
      <Pallet mats={mats} />
      {sim.items.map((it, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
          visible={false}
          onPointerDown={flick(i)}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <ItemMesh item={it} mats={mats} />
        </group>
      ))}
      <ContactShadows position={[0.3, 0.002, 0]} scale={[9, 5]} far={0.9} blur={2.2} opacity={0.42} resolution={512} />
    </>
  );
}

