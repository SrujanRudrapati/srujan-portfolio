// The site's pages after Home (runbook v4): the four hub tiles, then Explore and the CV.
export const MAIN_PAGES = [
  { href: "/work", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/explore", label: "Explore" },
  { href: "/cv", label: "CV" },
] as const;

/** True when a keyboard shortcut should not fire: the user is typing or a modifier is held. */
export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}
