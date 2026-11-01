"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { withBasePath } from "@/lib/paths";
import { render3DTier } from "./capability";
import { stageStateStore, stageStore, stageWake, type Slot } from "./stage-store";
import type { SceneName } from "./scenes/names";

type Props = {
  scene: SceneName;
  /** What the scene shows, for assistive tech; the content it illustrates is in the DOM text nearby. */
  label: string;
  className?: string;
  style?: CSSProperties;
  /** Hero only: a ref the page writes scroll progress (0 to 1) into. */
  progress?: { current: number };
  poster?: boolean;
  /** Above the fold: load the poster eagerly. */
  priority?: boolean;
  /** The scene also has a portrait poster (<id>-portrait.webp) for narrow screens. */
  portrait?: boolean;
};

/**
 * A 3D cover slot. The poster image is in the server HTML and is all a visitor
 * gets under reduced motion, on low-power devices, without WebGL, or if the
 * context fails. Otherwise the shared Stage3D canvas draws a live View over it
 * and the poster fades out once the first live frame is ready.
 */
export function SceneSlot({ scene, label, className, style, progress, poster = false, priority = false, portrait = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [live, setLive] = useState(false);
  const failed = useSyncExternalStore(stageStateStore.subscribe, stageStateStore.get, stageStateStore.getServer) === "failed";

  useEffect(() => {
    const el = ref.current;
    if (!el || (!poster && render3DTier() === "off")) return;
    const slot: Slot = { id, scene, el, active: false, progress: progress ?? null, poster, onReady: () => setLive(true) };
    const io = new IntersectionObserver(([e]) => {
      slot.active = e.isIntersecting;
      if (slot.active) stageWake.notify();
    }, { rootMargin: "15% 0px" });
    io.observe(el);
    // On the stage only while the slot has a size: a slot inside a hidden panel (display: none, e.g. the
    // Highlights index behind another lens on /explore) would otherwise keep a zero-size View, which WebKit
    // reports as an incomplete framebuffer on every frame (V7). ResizeObserver sees the switch to and from 0x0.
    let remove: (() => void) | null = null;
    const sync = () => {
      const shown = el.offsetWidth > 0 && el.offsetHeight > 0;
      if (shown && !remove) remove = stageStore.add(slot);
      else if (!shown && remove) {
        remove();
        remove = null;
        setLive(false);
      }
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => {
      io.disconnect();
      ro.disconnect();
      remove?.();
      setLive(false);
    };
  }, [id, scene, poster, progress]);

  const showLive = live && !failed;
  return (
    <div ref={ref} role="img" aria-label={label} className={className} data-scene={scene} data-live={showLive || undefined} style={{ position: "relative", ...style }}>
      {!poster && (
        <picture>
          {portrait && <source media="(max-width: 899px)" srcSet={withBasePath(`/posters/${scene}-portrait.webp`)} />}
          <img
            src={withBasePath(`/posters/${scene}.webp`)}
            alt=""
            aria-hidden
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: showLive ? 0 : 1, transition: "opacity 150ms linear", pointerEvents: "none" }}
          />
        </picture>
      )}
    </div>
  );
}
