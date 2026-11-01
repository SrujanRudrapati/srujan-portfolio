import type { SceneName } from "../components/three/scenes/names.ts";

// The 3D cover each featured project uses (runbook V1.5), shared by the home reel and the
// case-study pages. Labels describe the scene for assistive tech; figures in them are
// read from the graph by the caller where one appears.

export type Cover = { scene: Exclude<SceneName, "hero-stream">; label: string };

export const covers: Record<string, Cover> = {
  "surplus-ai": { scene: "surplus-line", label: "Boxes and electronics ride a roller conveyor through four aluminium compute units and settle on a wooden pallet." },
  "devhacks-cubbie": { scene: "receipts", label: "{receipts-tests} paper tiles, one per automated test in Receipts, fall in a domino wave." },
  "label-lens": { scene: "label-lens", label: "A medicine bottle turns under a scan line; flagged words peel off its label and stack into a warning column." },
  "supply-chain-watchtower": { scene: "watchtower", label: "A watchtower beacon sweeps over a terrain of nodes while pulses travel along the edges between them." },
};

/** Real screenshots, used instead of a scene where one exists (runbook V1.5). Sizes are the files' own. */
export const screenshots: Record<string, { wide: { src: string; width: number; height: number }; phone: { src: string; width: number; height: number }; alt: string }> = {
  "label-lens": {
    wide: { src: "/images/projects/label-lens-app.webp", width: 1280, height: 800 },
    phone: { src: "/images/projects/label-lens-app-phone.webp", width: 780, height: 1688 },
    alt: "The live Label Lens home page: \"Read the fine print, made for you.\" beside a phone showing a scanned snack-bar label flagged \"Contains peanuts\" and \"Not safe for you\".",
  },
};
