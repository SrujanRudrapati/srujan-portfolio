"use client";

import { useEffect } from "react";
import "lenis/dist/lenis.css"; // html.lenis height, scroll-behavior: auto while Lenis drives, data-lenis-prevent
import { StageHost } from "@/components/three/StageHost";
import { Cursor } from "./Cursor";
import { exposeMotionDebug } from "./debug";
import { Intro, INTRO_SCRIPT } from "./Intro";
import { PageTransitions } from "./PageTransitions";
import { SmoothScroll } from "./SmoothScroll";

/**
 * Everything that lives once per document across route changes: smooth scroll, page
 * transitions, the custom cursor, the first-visit intro and the shared 3D stage (so the
 * WebGL canvas persists between pages). Mount it once, in a layout.
 */
export function MotionRoot() {
  useEffect(() => exposeMotionDebug(), []);
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <Intro />
      <SmoothScroll />
      <PageTransitions />
      <Cursor />
      <StageHost />
    </>
  );
}
