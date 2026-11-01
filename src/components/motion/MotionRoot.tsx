"use client";

import { useEffect } from "react";
import { StageHost } from "@/components/three/StageHost";
import { exposeMotionDebug } from "./debug";

/**
 * Transitional (v4 W1 to W7): only the shared v3 3D stage and the test counters remain here
 * while pages that still use 3D slots are rebuilt. Smooth scroll, transitions and the cursor
 * moved to src/components/shell. Removed in W7 with three.js.
 */
export function MotionRoot() {
  useEffect(() => exposeMotionDebug(), []);
  return <StageHost />;
}
