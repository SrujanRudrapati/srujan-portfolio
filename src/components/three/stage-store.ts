// Registry of 3D slots on the page. SceneSlot (DOM, initial bundle) registers
// here; the lazily loaded Stage3D reads it and renders one drei View per slot
// through the single shared canvas.
import type { SceneName } from "./scenes/names";

export type Slot = {
  id: string;
  scene: SceneName;
  el: HTMLElement;
  /** On screen (with margin): only active slots simulate. Mutated in place, read every frame. */
  active: boolean;
  /** The hero's scroll progress (0 to 1), written by the page and read in the frame loop; null elsewhere. */
  progress: { current: number } | null;
  /** Poster mode: deterministic, settled, no ambient motion (scripts/assets/posters.mts). */
  poster: boolean;
  onReady: () => void;
};

let slots: Slot[] = [];
const EMPTY: Slot[] = [];
/** Stable server snapshot for useSyncExternalStore. */
export const getEmpty = () => EMPTY;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const stageStore = {
  add(slot: Slot) {
    slots = [...slots, slot];
    emit();
    return () => {
      slots = slots.filter((s) => s !== slot);
      emit();
    };
  },
  get: () => slots,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

// Stage lifecycle, shared by every StageHost instance for the whole session:
// "idle" until a page with slots asks; "requested" while waiting for load + idle;
// "ready" once it may mount (survives route changes and remounts); "failed" when
// WebGL is unavailable, an error is thrown, the context is lost, or reduced motion
// turns on mid-session: every slot then stays on its poster and the canvas unmounts.
type StageState = "idle" | "requested" | "ready" | "failed";
let stageState: StageState = "idle";
const stateListeners = new Set<() => void>();
const setStage = (next: StageState) => {
  if (stageState === "failed" || stageState === next) return;
  stageState = next;
  stateListeners.forEach((l) => l());
};

export const stageStateStore = {
  get: () => stageState,
  getServer: (): StageState => "idle",
  subscribe(l: () => void) {
    stateListeners.add(l);
    return () => stateListeners.delete(l);
  },
};

/** Asks for the WebGL stage once per session, after the load event, when the browser is idle. */
export function requestStage() {
  if (stageState !== "idle") return;
  setStage("requested");
  const ready = () => setStage("ready");
  const start = () => ("requestIdleCallback" in window ? requestIdleCallback(ready, { timeout: 1500 }) : setTimeout(ready, 200));
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
}

/** WebGL failed, threw, lost its context, or reduced motion turned on: posters only from here on. */
export function failStage() {
  setStage("failed");
}

// Slots tell the stage when one comes on screen, so the frame loop restarts at once instead of on the next poll.
const wakeListeners = new Set<() => void>();
export const stageWake = {
  notify: () => wakeListeners.forEach((l) => l()),
  subscribe(l: () => void) {
    wakeListeners.add(l);
    return () => wakeListeners.delete(l);
  },
};
