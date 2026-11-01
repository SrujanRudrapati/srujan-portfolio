"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { lenisStore } from "@/components/motion/lenis-store";
import { internalTarget, isPendingArrival } from "./route-paths";

// Route changes (runbook v4 W1.6, motion-system): the old page fades out over 260 ms and the
// new one rises 14px into place over 800 ms. The View Transitions API where supported (the
// keyframes are in globals.css); otherwise classes on <main>. Reduced motion: instant.
// After our own navigations: scroll to the top (or the link's #anchor) and focus the new h1.

const REDUCED = "(prefers-reduced-motion: reduce)";
const FADE_MS = 260;
const ENTER_MS = 800;
const TIMEOUT_MS = 4000;

type DocWithVT = Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void>; ready: Promise<void> } };

function hashId(): string {
  const raw = location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw; // a malformed escape: use it as written
  }
}

function focusTarget(): HTMLElement | null {
  const id = hashId();
  return (id && document.getElementById(id)) || document.querySelector<HTMLElement>("main h1");
}

function resetScroll() {
  const lenis = lenisStore.get();
  lenis?.resize();
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const arrived = useRef<(() => void) | null>(null);
  /** The target of our navigation in flight; survives the timeout so a slow route still lands at the top. */
  const pending = useRef<string | null>(null);
  const firstPath = useRef<string | null>(pathname);
  const fallbackEnter = useRef(false);

  // Arrival. Only our own navigations reset scroll; back and forward keep the browser's restoration.
  useEffect(() => {
    if (firstPath.current === pathname) return;
    firstPath.current = null;
    const finish = arrived.current;
    arrived.current = null;
    finish?.();
    const ours = finish !== null || isPendingArrival(pending.current, pathname);
    pending.current = null;
    if (ours) resetScroll();

    const main = document.querySelector("main");
    let enterTimer = 0;
    if (main && fallbackEnter.current) {
      fallbackEnter.current = false;
      main.classList.remove("route-leave");
      main.classList.add("route-enter");
      enterTimer = window.setTimeout(() => main.classList.remove("route-enter"), ENTER_MS);
    }
    const raf = requestAnimationFrame(() => {
      const el = focusTarget();
      if (ours && el && location.hash) {
        const lenis = lenisStore.get();
        if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
        else el.scrollIntoView();
      }
      if (el) {
        if (!el.hasAttribute("tabindex")) el.tabIndex = -1;
        el.focus({ preventScroll: true });
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(enterTimer);
    };
  }, [pathname]);

  useEffect(() => {
    let leaveTimer = 0;
    /** Undo a fallback fade that will not be followed by an arrival (timeout, Back, unmount). */
    const clearLeave = () => {
      clearTimeout(leaveTimer);
      leaveTimer = 0;
      fallbackEnter.current = false;
      document.querySelector("main")?.classList.remove("route-leave");
    };

    const go = (href: string) =>
      new Promise<void>((resolve) => {
        const done = (timedOut = false) => {
          clearTimeout(timer);
          if (arrived.current === done) arrived.current = null;
          if (timedOut) clearLeave();
          resolve();
        };
        // Never hang a transition on a slow route; a timed-out navigation no longer counts as ours.
        const timer = setTimeout(() => done(true), TIMEOUT_MS);
        arrived.current = done;
        pending.current = href;
        router.push(href, { scroll: false });
      });

    const navigate = (href: string) => {
      const doc = document as DocWithVT;
      if (matchMedia(REDUCED).matches) return void go(href);
      if (doc.startViewTransition) {
        const t = doc.startViewTransition(() => go(href));
        t.ready.catch(() => {}); // skipped transitions (hidden tab) reject; the navigation still happens
        return;
      }
      const main = document.querySelector("main");
      if (!main) return void go(href);
      main.classList.add("route-leave");
      fallbackEnter.current = true;
      // Busy from the first frame of the fade, so a second click or Back can find and cancel it.
      arrived.current = clearLeave;
      leaveTimer = window.setTimeout(() => {
        leaveTimer = 0;
        void go(href);
      }, FADE_MS);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return; // SVG <a> has no string href
      const href = internalTarget(a);
      if (!href) return;
      // Capture phase. preventDefault only: next/link then skips its own navigation.
      e.preventDefault();
      if (arrived.current) {
        // A second link during a transition: drop the first fade and go straight there, untransitioned.
        if (leaveTimer) clearLeave();
        pending.current = href;
        router.push(href, { scroll: false });
        return;
      }
      navigate(href);
    };
    document.addEventListener("click", onClick, { capture: true });
    const onPop = () => {
      pending.current = null;
      clearLeave();
      const finish = arrived.current;
      arrived.current = null;
      finish?.();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPop);
      clearLeave();
    };
  }, [router]);

  return null;
}
