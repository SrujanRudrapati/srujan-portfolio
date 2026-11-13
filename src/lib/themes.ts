// The v5 section themes (design/redesign.html, THEMES). Each is [ground, ink, thread]. A section
// opts in with data-theme="<name>"; the home thread swaps the three registered colours on <html>
// as the section passes 55% of the viewport, and @property makes the swap a 0.9 s fade.

export type ThemeName = "paper" | "surplus" | "invoice" | "label" | "sync" | "hacks" | "celebal" | "night";
export type Theme = readonly [ground: string, ink: string, thread: string];

export const THEMES: Readonly<Record<ThemeName, Theme>> = {
  paper: ["#f4f0e8", "#26241f", "#c2673f"],
  surplus: ["#eddcd2", "#3a2024", "#b0563f"],
  invoice: ["#dfe8dc", "#1f2d25", "#c2673f"],
  label: ["#f1e7c6", "#2b2516", "#4f6fa8"],
  sync: ["#d9e3ec", "#1c2a3a", "#b8862b"],
  hacks: ["#e4dff0", "#262238", "#6b5bb5"],
  celebal: ["#d5e4e1", "#17302f", "#c26a3a"],
  night: ["#1f2a2b", "#f0ebdf", "#e0b464"],
};

export const DEFAULT_THEME: ThemeName = "paper";

export function isThemeName(name: string | null | undefined): name is ThemeName {
  return !!name && Object.hasOwn(THEMES, name);
}

/** Writes a theme's three colours on an element (the root), or removes them to fall back to the stylesheet. */
export function applyTheme(el: HTMLElement, name: ThemeName | null): void {
  if (!name) {
    for (const prop of ["--ground", "--ink", "--thread"]) el.style.removeProperty(prop);
    return;
  }
  const [ground, ink, thread] = THEMES[name];
  el.style.setProperty("--ground", ground);
  el.style.setProperty("--ink", ink);
  el.style.setProperty("--thread", thread);
}
