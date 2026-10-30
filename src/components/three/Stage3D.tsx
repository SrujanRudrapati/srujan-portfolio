"use client";

import { Suspense, useEffect, useMemo, useSyncExternalStore } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { AgXToneMapping, PCFShadowMap, SRGBColorSpace } from "three";
import { render3DTier, type Tier } from "./capability";
import { loadStudioEnv } from "./env";
import { failStage, getEmpty, stageStore, stageWake, type Slot } from "./stage-store";
import { SceneByName } from "./scenes";

// The one WebGL canvas on the page (motion-system). Fixed over the viewport,
// transparent and click-through; each SceneSlot gets a drei View that scissors
// its own region. drei skips Views that are off screen; scenes also stop
// simulating when their slot is inactive, and the loop stops when none is.

const DPR: Record<Tier, [number, number]> = { off: [1, 1], mobile: [1, 1.25], desktop: [1, 1.5] };

/** Image-based light from the shared studio HDRI, applied to this View's scene. */
function StudioLight({ intensity = 1 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    let alive = true;
    loadStudioEnv(gl).then((env) => {
      if (!alive) return;
      scene.environment = env;
      scene.environmentIntensity = intensity;
    })
      .catch(() => undefined); // failure already switched the page to posters (failStage)
    return () => {
      alive = false;
    };
  }, [gl, scene, intensity]);
  return null;
}

/** Runs the frame loop only while some slot is on screen (always in poster mode). */
function LoopGovernor({ poster }: { poster: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (poster) return;
    let last = "";
    const update = () => {
      const mode = stageStore.get().some((s) => s.active) && document.visibilityState === "visible" ? "always" : "never";
      if (mode !== last) {
        last = mode;
        setFrameloop(mode);
        if (mode === "always") invalidate();
      }
    };
    // A slot coming on screen wakes the loop at once; the poll catches slots leaving and tab changes.
    const unsubscribe = stageWake.subscribe(update);
    document.addEventListener("visibilitychange", update);
    const id = setInterval(update, 250);
    update();
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", update);
      clearInterval(id);
    };
  }, [poster, setFrameloop, invalidate]);
  return null;
}

function ContextWatch() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      failStage();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);
  return null;
}

function SlotView({ slot, index, tier }: { slot: Slot; index: number; tier: Tier }) {
  const track = useMemo(() => ({ current: slot.el }), [slot.el]);
  const Scene = SceneByName[slot.scene];
  return (
    <View track={track} index={index}>
      <StudioLight />
      <Suspense fallback={null}>
        <Scene slot={slot} tier={tier} />
      </Suspense>
    </View>
  );
}

export default function Stage3D({ poster = false }: { poster?: boolean }) {
  const slots = useSyncExternalStore(stageStore.subscribe, stageStore.get, getEmpty);
  const tier: Tier = poster ? "desktop" : render3DTier();

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none" }}>
      <Canvas
        eventSource={typeof document === "undefined" ? undefined : document.body}
        eventPrefix="client"
        dpr={DPR[tier]}
        shadows={{ type: PCFShadowMap }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: poster }}
        onCreated={({ gl }) => {
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = SRGBColorSpace;
          gl.setClearColor(0x000000, 0);
        }}
        fallback={null}
        style={{ pointerEvents: "none" }}
      >
        <LoopGovernor poster={poster} />
        <ContextWatch />
        {slots.filter((slot) => slot.poster === poster).map((slot, i) => (
          <SlotView key={slot.id} slot={slot} index={i + 1} tier={tier} />
        ))}
      </Canvas>
    </div>
  );
}
