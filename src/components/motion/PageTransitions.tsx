"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "./gsap";
import { lenisStore } from "./lenis-store";
import s from "./motion.module.css";

// Route changes in the Pipeline's language: the data line sweeps across and the next
// page is revealed behind it (motion-system: at most 600 ms). With the View Transitions
// API the new page wipes in under a moving accent line; without it, a GSAP overlay does
// the same. Reduced motion: a 150 ms crossfade (or an instant swap without the API).
// After our own navigations: scroll to the top (or to the link's #anchor), refresh
// ScrollTrigger, and move focus to the new h1 (or the anchor target).

const REDUCED = "(prefers-reduced-motion: reduce)";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TIMEOUT_MS = 4000;

type DocWithVT = Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };

/** "/srujan-portfolio/work/" and "/work" compare equal: no basePath, no trailing slash. */
export function appPath(pathname: string, base = BASE): string {
  const stripped = base && (pathname === base || pathname.startsWith(`${base}/`)) ? pathname.slice(base.length) || "/" : pathname;
  return stripped.length > 1 ? stripped.replace(/\/$/, "") : stripped;
}

/** Whether a route that just arrived is the one we navigated to (path only; search and #hash ignored).
 *  Kept apart from the transition's timeout: a slow route that outlasts TIMEOUT_MS still lands at the top. */
export function isPendingArrival(pending: string | null, pathname: string, base = BASE): boolean {
  return pending !== null && appPath(pending.split(/[?#]/)[0], base) === appPath(pathname, base);
}

/** The router target for an internal page link, or null for anything we should not intercept. */
function internalTarget(a: HTMLAnchorElement): string | null {
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download") || a.dataset.noTransition !== undefined || /\bexternal\b/.test(a.rel)) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null; // files such as /resume.pdf
  const path = appPath(url.pathname);
  if (path === appPath(location.pathname)) return null; // same page or an in-page anchor
  // router.push adds the basePath itself, so hand it the app path.
  return path + url.search + url.hash;
}

function focusTarget(): HTMLElement | null {
  const id = decodeURIComponent(location.hash.slice(1));
  return (id && document.getElementById(id)) || document.querySelector<HTMLElement>("main h1");
}

export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const arrived = useRef<(() => void) | null>(null);
  /** The router target of our navigation in flight. Unlike `arrived`, it survives the transition timeout,
   *  so a route slower than TIMEOUT_MS still resets scroll and focus when it lands. Back/forward clear it. */
  const pending = useRef<string | null>(null);
  const firstPath = useRef<string | null>(pathname);
  const overlay = useRef<HTMLDivElement>(null);
  const overlayTl = useRef<gsap.core.Timeline | null>(null);

  // Arrival. Only our own navigations reset scroll; back and forward keep the browser's restoration.
  useEffect(() => {
    if (firstPath.current === pathname) return;
    firstPath.current = null;
    const finish = arrived.current;
    arrived.current = null;
    finish?.();
    const ours = finish !== null || isPendingArrival(pending.current, pathname);
    pending.current = null;
    // Our navigations start at the top; an #anchor is scrolled to after the refresh below,
    // once pins and splits have settled the layout.
    if (ours) {
      lenisStore.get()?.resize();
      lenisStore.get()?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const el = focusTarget();
      if (ours && el && location.hash) {
        const aim = () => {
          const lenis = lenisStore.get();
          // Lenis caches the scroll limit; the new page is a different height, so measure first.
          lenis?.resize();
          if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
          else el.scrollIntoView();
        };
        aim();
        // Split headings re-split once fonts load and can shift the page; aim again after that.
        document.fonts?.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(aim)));
      }
      if (el) {
        if (!el.hasAttribute("tabindex")) el.tabIndex = -1;
        el.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    const overlayEl = overlay.current;
    const go = (href: string) =>
      new Promise<void>((resolve) => {
        const done = () => {
          clearTimeout(timer);
          if (arrived.current === done) arrived.current = null;
          resolve();
        };
        // Never hang a transition on a slow route; a timed-out navigation no longer counts as ours.
        const timer = setTimeout(done, TIMEOUT_MS);
        arrived.current = done;
        pending.current = href;
        router.push(href, { scroll: false });
      });

    const navigate = (href: string) => {
      const doc = document as DocWithVT;
      const root = document.documentElement;
      const reduced = matchMedia(REDUCED).matches;
      if (doc.startViewTransition) {
        root.dataset.vt = reduced ? "fade" : "sweep";
        let line: HTMLDivElement | null = null;
        const t = doc.startViewTransition(async () => {
          await go(href);
          if (!reduced) {
            line = document.createElement("div");
            line.className = s.routeLine;
            line.setAttribute("aria-hidden", "true");
            document.body.append(line);
          }
        });
        t.finished.finally(() => {
          line?.remove();
          delete root.dataset.vt;
        });
        return;
      }
      const el = overlayEl;
      if (reduced || !el) return void go(href);
      overlayTl.current = gsap
        .timeline()
        .set(el, { display: "block", xPercent: -100 })
        .to(el, { xPercent: 0, duration: 0.28, ease: "power3.in" })
        .add(() => {
          go(href).then(() => {
            overlayTl.current = gsap.timeline().to(el, { xPercent: 100, duration: 0.3, ease: "power3.out" }).set(el, { display: "none" });
          });
        });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return; // SVG <a> has no string href
      const href = internalTarget(a);
      if (!href) return;
      // Capture phase. preventDefault only: the link's own onClick still runs, and next/link
      // then skips its navigation because the event is already handled.
      e.preventDefault();
      if (arrived.current) return; // one transition at a time
      navigate(href);
    };
    document.addEventListener("click", onClick, { capture: true });
    // Back and forward are the browser's: its scroll restoration applies, not our reset.
    const onPop = () => {
      pending.current = null;
      const finish = arrived.current;
      arrived.current = null;
      finish?.(); // ends the view transition; the arrival then keeps the browser's scroll restoration
    };
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPop);
      overlayTl.current?.kill();
      if (overlayEl) gsap.set(overlayEl, { display: "none" });
    };
  }, [router]);

  return (
    <div ref={overlay} className={s.routeOverlay} aria-hidden>
      <span className={s.routeOverlayLine} />
    </div>
  );
}
