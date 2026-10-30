// The site's pages (runbook V3). Number keys 1 to 4 jump to the main pages in this order.
export const MAIN_PAGES = [
  { href: "/work", label: "Work", key: "1", stage: "transform" },
  { href: "/explore", label: "Explore", key: "2", stage: "views" },
  { href: "/about", label: "About", key: "3", stage: "source" },
  { href: "/cv", label: "CV", key: "4", stage: "one page" },
] as const;

export const PALETTE_OPEN = "palette:open";
export const openPalette = () => window.dispatchEvent(new Event(PALETTE_OPEN));

/** True when a keyboard shortcut should not fire: the user is typing or a modifier is held. */
export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}
