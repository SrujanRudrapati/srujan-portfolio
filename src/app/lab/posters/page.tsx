import { Archivo } from "next/font/google";
import { SceneSlot } from "@/components/three/SceneSlot";
import { StageHost } from "@/components/three/StageHost";

// Poster studio: renders every 3D scene once, settled and deterministic, at a fixed
// size, for scripts/assets/posters.mts to capture into public/posters/. Not linked;
// noindex via the lab layout; removed with /lab in V7 once posters move to a script-only route.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--a-display", display: "swap" });

export const metadata = { title: "Lab: poster studio" };

const SHOTS = [
  { id: "hero-stream", scene: "hero-stream", w: 1260, h: 900 },
  { id: "hero-stream-portrait", scene: "hero-stream", w: 800, h: 1000 },
  { id: "surplus-line", scene: "surplus-line", w: 1280, h: 800 },
  { id: "label-lens", scene: "label-lens", w: 1280, h: 800 },
  { id: "watchtower", scene: "watchtower", w: 1280, h: 800 },
  { id: "receipts", scene: "receipts", w: 1280, h: 800 },
] as const;

export default function Posters() {
  return (
    <main className={display.variable} style={{ fontFamily: "var(--a-display)", background: "transparent" }}>
      {SHOTS.map((s) => (
        <div key={s.id} data-poster={s.id} style={{ width: s.w, height: s.h }}>
          <SceneSlot scene={s.scene} label={s.id} poster style={{ width: s.w, height: s.h }} />
        </div>
      ))}
      <StageHost poster />
    </main>
  );
}
