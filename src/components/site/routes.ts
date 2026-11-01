// The site's pages (runbook V3). Number keys 1 to 4 jump to the main pages in this order.
export const MAIN_PAGES = [
  { href: "/work", label: "Work", key: "1", stage: "transform" },
  { href: "/explore", label: "Explore", key: "2", stage: "views" },
  { href: "/about", label: "About", key: "3", stage: "source" },
  { href: "/cv", label: "CV", key: "4", stage: "one page" },
] as const;

export const PALETTE_OPEN = "palette:open";
/** Ask mode (the home page's Ask box): open with the question typed in and "Ask about my work" selected. */
export type PaletteOpenDetail = {
  query?: string;
  ask?: boolean;
  /** The control that opened the palette; focus returns to it on close. Passed explicitly because Safari
   *  does not focus a button on click, so document.activeElement would be <body> (V7). */
  opener?: HTMLElement;
};
export const openPalette = (detail: PaletteOpenDetail = {}) => window.dispatchEvent(new CustomEvent<PaletteOpenDetail>(PALETTE_OPEN, { detail }));

/** True when a keyboard shortcut should not fire: the user is typing or a modifier is held. */
export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}
