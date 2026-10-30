"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, DoubleSide, InstancedMesh, LineBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, PointsMaterial, SphereGeometry, Vector3, type Group } from "three";
import { loadStudioEnv } from "../env";
import { loadMaps } from "../ktx";
import { rng } from "../rng";
import { useSceneReady } from "../useSceneReady";
import type { SceneProps } from ".";

// Supply Chain Watchtower (runbook V1.5): a watchtower beacon over a terrain of nodes,
// with pulses travelling along the edges between them. A visual metaphor only: it makes
// no claim about scale, users or deployment (portfolio-facts: never "shipped" or
// "production" for Watchtower). The beacon sweeps; each pulse is a point moving along
// an edge at constant speed, handed on to a neighbouring edge when it arrives.

const NODES = 26;
const PULSES = 18;
const ACCENT = new Color("#1D4ED8");
const POSTER_TIME = 7.5;

function terrainHeight(x: number, z: number) {
  return 0.18 * Math.sin(x * 1.3) * Math.cos(z * 1.1) + 0.1 * Math.sin(x * 2.7 + z * 1.9) + 0.05 * Math.cos(z * 3.1 - x);
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export default function Watchtower({ slot }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const [ready, setReady] = useState(false);
  const [maps, setMaps] = useState<{ ground?: MeshStandardMaterial; post?: MeshStandardMaterial; steel?: MeshStandardMaterial }>({});
  useEffect(() => {
    let alive = true;
    Promise.all([loadMaps(gl, "aluminium", ["orm"], 2), loadStudioEnv(gl)])
      .then(([alu]) => {
        if (!alive) return;
        setMaps({
          ground: new MeshStandardMaterial({ color: "#e9e9e6", roughness: 0.95, flatShading: true }),
          post: new MeshStandardMaterial({ color: "#d4d8dc", roughnessMap: alu.roughnessMap, metalness: 0.75, roughness: 0.4 }),
          steel: new MeshStandardMaterial({ color: "#4a4f55", roughnessMap: alu.roughnessMap, metalness: 0.85, roughness: 0.45 }),
        });
        setReady(true);
      })
      .catch(() => undefined); // failure already switched the page to posters (failStage)
    return () => {
      alive = false;
    };
  }, [gl]);
  useEffect(() => () => Object.values(maps).forEach((m) => m?.dispose()), [maps]);
  useSceneReady(slot, ready);

  // Terrain, nodes and a sparse graph (each node joined to its two nearest neighbours).
  const world = useMemo(() => {
    const rand = rng(23);
    const terrain = new PlaneGeometry(6, 4, 48, 32);
    terrain.rotateX(-Math.PI / 2);
    const pos = terrain.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
    terrain.computeVertexNormals();
    const nodes: Vector3[] = [];
    while (nodes.length < NODES) {
      const x = (rand() - 0.5) * 5.2;
      const z = (rand() - 0.5) * 3.2;
      if (Math.hypot(x - 0.2, z + 0.2) < 0.45) continue; // keep the tower's footprint clear
      if (nodes.some((n) => Math.hypot(n.x - x, n.z - z) < 0.42)) continue;
      nodes.push(new Vector3(x, terrainHeight(x, z) + 0.09, z));
    }
    const edgeSet = new Set<string>();
    const edges: [number, number][] = [];
    nodes.forEach((n, i) => {
      const near = nodes.map((m, j) => ({ j, d: n.distanceTo(m) })).filter((x) => x.j !== i).sort((a, b) => a.d - b.d).slice(0, 2);
      for (const { j } of near) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push([i, j]);
        }
      }
    });
    const lineGeo = new BufferGeometry();
    const arr = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => arr.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], k * 6));
    lineGeo.setAttribute("position", new BufferAttribute(arr, 3));
    // Pulses: each rides one edge from a to b, then picks another edge leaving b.
    const pulses = Array.from({ length: PULSES }, () => {
      const e = edges[Math.floor(rand() * edges.length)];
      return { from: e[0], to: e[1], t: rand(), speed: 0.35 + rand() * 0.25 };
    });
    const pulseGeo = new BufferGeometry();
    pulseGeo.setAttribute("position", new BufferAttribute(new Float32Array(PULSES * 3), 3));
    return { rand, terrain, nodes, edges, lineGeo, pulses, pulseGeo };
  }, []);
  useEffect(
    () => () => {
      world.terrain.dispose();
      world.lineGeo.dispose();
      world.pulseGeo.dispose();
    },
    [world],
  );

  const shared = useMemo(
    () => ({
      postGeo: new CylinderGeometry(0.025, 0.035, 0.18, 10),
      line: new LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.45 }),
      pulse: new PointsMaterial({ color: ACCENT, size: 0.16, map: glowTexture(), transparent: true, opacity: 0.55, depthWrite: false }), // normal blending: additive glow writes black on a transparent canvas over a white page
      pulseCore: new SphereGeometry(0.03, 12, 8),
      beam: new MeshStandardMaterial({ color: "#000000", emissive: ACCENT, emissiveIntensity: 1.2, transparent: true, opacity: 0.1, side: DoubleSide, depthWrite: false }),
      lamp: new MeshStandardMaterial({ color: "#0b1330", emissive: ACCENT, emissiveIntensity: 5 }),
      beamGeo: new ConeGeometry(0.45, 2, 24, 1, true),
    }),
    [],
  );
  useEffect(
    () => () => {
      shared.postGeo.dispose();
      shared.line.dispose();
      shared.pulse.map?.dispose();
      shared.pulse.dispose();
      shared.pulseCore.dispose();
      shared.beam.dispose();
      shared.lamp.dispose();
      shared.beamGeo.dispose();
    },
    [shared],
  );

  const posts = useRef<InstancedMesh>(null);
  const cores = useRef<InstancedMesh>(null);
  const beacon = useRef<Group>(null);
  const tmp = useMemo(() => ({ o: new Object3D(), v: new Vector3() }), []);

  useEffect(() => {
    const m = posts.current;
    if (!m) return;
    world.nodes.forEach((n, i) => {
      tmp.o.position.set(n.x, n.y - 0.0, n.z);
      tmp.o.updateMatrix();
      m.setMatrixAt(i, tmp.o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [world, tmp, ready]);

  const time = useRef(0);
  const advance = (dt: number) => {
    time.current += dt;
    const { pulses, nodes, edges, rand } = world;
    for (const p of pulses) {
      const len = nodes[p.from].distanceTo(nodes[p.to]);
      p.t += (p.speed * dt) / Math.max(0.2, len);
      if (p.t >= 1) {
        const next = edges.filter(([a, b]) => (a === p.to || b === p.to) && !(a === p.from || b === p.from));
        const e = next.length ? next[Math.floor(rand() * next.length)] : edges[Math.floor(rand() * edges.length)];
        p.from = e[0] === p.to ? e[0] : e[1] === p.to ? e[1] : e[0];
        p.to = p.from === e[0] ? e[1] : e[0];
        p.t = 0;
      }
    }
  };

  const write = () => {
    const attr = world.pulseGeo.getAttribute("position") as BufferAttribute;
    const m = cores.current;
    world.pulses.forEach((p, i) => {
      tmp.v.lerpVectors(world.nodes[p.from], world.nodes[p.to], p.t);
      attr.setXYZ(i, tmp.v.x, tmp.v.y + 0.01, tmp.v.z);
      if (m) {
        tmp.o.position.copy(tmp.v);
        tmp.o.updateMatrix();
        m.setMatrixAt(i, tmp.o.matrix);
      }
    });
    attr.needsUpdate = true;
    if (m) m.instanceMatrix.needsUpdate = true;
    if (beacon.current) beacon.current.rotation.y = time.current * 0.6;
  };

  const warmed = useRef(false);
  useFrame((_, delta) => {
    if (!ready) return;
    if (!warmed.current) {
      warmed.current = true;
      if (slot.poster) for (let t = 0; t < POSTER_TIME; t += 1 / 60) advance(1 / 60);
    }
    if (!slot.poster && slot.active) advance(Math.min(delta, 0.05));
    write();
  });

  if (!ready || !maps.ground || !maps.post || !maps.steel) return null;
  const towerX = 0.2;
  const towerZ = -0.2;
  const baseY = terrainHeight(towerX, towerZ);
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.4, 3.1, 4.6]} fov={32} near={0.5} far={30} onUpdate={(c) => c.lookAt(0.1, 0.35, -0.1)} />
      <directionalLight position={[-3, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-3.2} shadow-camera-right={3.2} shadow-camera-top={2.2} shadow-camera-bottom={-2.2} />
      <mesh geometry={world.terrain} material={maps.ground} receiveShadow />
      <lineSegments geometry={world.lineGeo} material={shared.line} />
      <instancedMesh ref={posts} args={[shared.postGeo, maps.post, NODES]} castShadow />
      <instancedMesh ref={cores} args={[shared.pulseCore, shared.lamp, PULSES]} frustumCulled={false} />
      <points geometry={world.pulseGeo} material={shared.pulse} frustumCulled={false} />
      {/* The tower: four splayed steel legs, a deck, and a beacon that sweeps a soft beam. */}
      <group position={[towerX, baseY, towerZ]}>
        {[
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([sx, sz]) => (
          <mesh key={`${sx}${sz}`} material={maps.steel} position={[sx * 0.11, 0.6, sz * 0.11]} rotation={[sz * -0.09, 0, sx * 0.09]} castShadow>
            <cylinderGeometry args={[0.012, 0.016, 1.2, 8]} />
          </mesh>
        ))}
        {[0.35, 0.7].map((y) => (
          <mesh key={y} material={maps.steel} position={[0, y, 0]}>
            <boxGeometry args={[0.26 - y * 0.08, 0.012, 0.26 - y * 0.08]} />
          </mesh>
        ))}
        <mesh material={maps.post} position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.3, 0.03, 0.3]} />
        </mesh>
        <mesh material={maps.steel} position={[0, 1.4, 0]} castShadow>
          <coneGeometry args={[0.2, 0.14, 4]} />
        </mesh>
        <group ref={beacon} position={[0, 1.26, 0]}>
          <mesh material={shared.lamp}>
            <sphereGeometry args={[0.045, 16, 12]} />
          </mesh>
          <mesh material={shared.beam} position={[1.0, -0.42, 0]} rotation={[0, 0, Math.PI / 2 + 0.38]} geometry={shared.beamGeo} />
        </group>
      </group>
      <ContactShadows position={[0, -0.25, 0]} scale={[7, 5]} far={1.2} blur={2.5} opacity={0.3} resolution={512} />
    </>
  );
}
