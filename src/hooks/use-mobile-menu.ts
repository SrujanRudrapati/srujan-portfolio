import { useCallback, useEffect, useRef, useState } from "react";

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * State and behaviour for the mobile nav panel: focus trapped inside the
 * header while open, Escape closes and returns focus to the menu button,
 * page scroll locked, and the panel closes itself if the viewport grows
 * past the desktop breakpoint.
 */
export function useMobileMenu() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const header = headerRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    // Everything behind the open menu is inert: no Tab stops, no screen-reader browsing.
    const behind = [document.querySelector("main"), document.querySelector("body > footer")].filter((el): el is HTMLElement => !!el);
    behind.forEach((el) => (el.inert = true));

    const visibleFocusables = () =>
      Array.from(header?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.offsetParent !== null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = visibleFocusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (!current || !items.includes(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => {
      if (desktop.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      root.style.overflow = previousOverflow;
      behind.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return { open, setOpen, close, headerRef, buttonRef };
}
