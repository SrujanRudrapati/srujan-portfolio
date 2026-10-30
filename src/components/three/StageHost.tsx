"use client";

import { Component, lazy, Suspense, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { render3DTier } from "./capability";
import { failStage, getEmpty, requestStage, stageStateStore, stageStore } from "./stage-store";

// The only import of three.js on the page goes through this lazy boundary, so
// the 3D chunk never touches the initial bundle (motion-system: one canvas, after first paint).
const Stage3D = lazy(() => import("./Stage3D"));

/** Anything the 3D layer throws (renderer creation, a scene chunk that fails to load) leaves the posters, never an error page. */
class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    failStage();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function StageHost({ poster = false }: { poster?: boolean }) {
  const slots = useSyncExternalStore(stageStore.subscribe, stageStore.get, getEmpty);
  const state = useSyncExternalStore(stageStateStore.subscribe, stageStateStore.get, stageStateStore.getServer);
  const wanted = slots.length > 0;

  useEffect(() => {
    if (wanted && !poster && render3DTier() !== "off") requestStage();
  }, [wanted, poster]);

  if (!wanted || state === "failed" || !(poster || state === "ready")) return null;
  return (
    <StageBoundary>
      <Suspense fallback={null}>
        <Stage3D poster={poster} />
      </Suspense>
    </StageBoundary>
  );
}
