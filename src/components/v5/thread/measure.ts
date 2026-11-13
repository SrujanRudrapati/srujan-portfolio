// DOM measurement for the thread: fit the giant headings, then read pins, themed sections and
// ghosts in coordinates relative to the thread's container (its offset parent).

import { isThemeName, type ThemeName } from "@/lib/themes";
import type { Band, Point } from "./geometry";

const WIDE = 860;
const PROBE_PX = 100;
const FIT_SLACK = 0.985;

/** Sizes every line of every giant heading to fill its heading's width (prototype fit()). */
export function fitGiants(root: ParentNode): void {
  const wide = innerWidth >= WIDE;
  for (const g of root.querySelectorAll<HTMLElement>("[data-giant]")) {
    const avail = g.clientWidth;
    for (const line of g.querySelectorAll<HTMLElement>("[data-gl]")) {
      line.style.fontSize = `${PROBE_PX}px`;
      const w = line.getBoundingClientRect().width || 1;
      let cap = innerWidth * (wide ? 0.19 : 0.52);
      if (wide && g.dataset.giant === "hero") cap = Math.min(cap, innerHeight * 0.24);
      line.style.fontSize = `${(Math.min((PROBE_PX * avail) / w, cap) * FIT_SLACK).toFixed(1)}px`;
    }
  }
}

export type Ghost = { el: HTMLElement; mid: number; rot: number };

export type Layout = {
  width: number;
  height: number;
  pins: Point[];
  kolam: Point | null;
  bands: Band<ThemeName>[];
  ghosts: Ghost[];
};

/** Everything the thread needs, relative to `box` (the element the SVG is absolutely positioned in). */
export function measure(box: HTMLElement): Layout {
  const origin = box.getBoundingClientRect();
  const rel = (r: DOMRect): Point => [r.left - origin.left, r.top - origin.top];

  const pins: Point[] = [];
  let kolam: Point | null = null;
  for (const el of box.querySelectorAll<HTMLElement>("[data-pin]")) {
    if (el.getClientRects().length === 0) continue; // a pin hidden at this width (display: none)
    const p = rel(el.getBoundingClientRect());
    if (el.dataset.pin === "kolam") kolam = p;
    else pins.push(p);
  }

  const bands: Band<ThemeName>[] = [];
  for (const el of box.querySelectorAll<HTMLElement>("[data-theme]")) {
    const name = el.dataset.theme;
    if (!isThemeName(name)) continue;
    const r = el.getBoundingClientRect();
    bands.push({ name, top: r.top - origin.top, bottom: r.bottom - origin.top });
  }

  const ghosts: Ghost[] = [];
  for (const el of box.querySelectorAll<HTMLElement>("[data-ghost]")) {
    el.style.transform = "none";
    const r = el.getBoundingClientRect();
    ghosts.push({ el, mid: r.top - origin.top + r.height / 2, rot: el.dataset.ghost === "flip" ? 9 : -9 });
  }

  return { width: box.clientWidth, height: box.scrollHeight, pins, kolam, bands, ghosts };
}
