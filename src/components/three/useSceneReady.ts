import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Slot } from "./stage-store";

/** Tells the slot its live view is drawing (poster fades out) after two frames rendered while it is on screen and loaded. */
export function useSceneReady(slot: Slot, loaded: boolean) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (!loaded || done.current || !(slot.active || slot.poster)) return;
    frames.current += 1;
    if (frames.current >= 2) {
      done.current = true;
      slot.onReady();
    }
  });
}
