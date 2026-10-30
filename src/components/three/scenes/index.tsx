import { lazy, type ComponentType } from "react";
import type { Tier } from "../capability";
import type { Slot } from "../stage-store";
import type { SceneName } from "./names";

export type SceneProps = { slot: Slot; tier: Tier };

// Each scene is its own chunk; a page only downloads the scenes it shows.
export const SceneByName: Record<SceneName, ComponentType<SceneProps>> = {
  "hero-stream": lazy(() => import("./HeroStream")),
  "surplus-line": lazy(() => import("./SurplusLine")),
  "label-lens": lazy(() => import("./LabelLens")),
};
