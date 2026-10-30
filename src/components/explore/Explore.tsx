"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { Graph } from "@/data/graph/types";
import { useGraph } from "@/hooks/use-graph";
import { LensErrorBoundary } from "./LensErrorBoundary";
import { DEFAULT_LENS, LENSES, lensFromHash, type LensId } from "./lenses";
import { LensSwitcher } from "./LensSwitcher";

// The Work section's lens switcher. Highlights is the server-rendered default
// (children), complete without JavaScript and kept mounted so its filter state
// survives a round trip. The other lenses render from public/graph.json; their
// code (GraphLens) and the JSON both load on first use. The lens lives in
// location.hash (#lens=timeline). Any in-page link to #lens=<id> switches lens
// even when the hash is already that value, and a #project-<slug> hash switches
// back to Highlights so card links always land.

/** Event the Highlights filter listens for, so a link to a card it currently hides can show it. */
export const SHOW_ALL_PROJECTS = "work:show-all";

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ block: "start" });

export function Explore({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<LensId>(DEFAULT_LENS);
  const [switched, setSwitched] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusAfterSwitch = useRef(false);
  const { state: graphState, retry } = useGraph(lens !== DEFAULT_LENS);
  // The lens code loads with graph.json, on first use. A failed import (a stale chunk after a redeploy,
  // a dropped request) is retried by "try again", which bumps `attempt` and re-runs the import.
  const [attempt, setAttempt] = useState(0);
  const [LensView, setLensView] = useState<ComponentType<{ lens: Exclude<LensId, "highlights">; graph: Graph }> | null>(null);
  const [chunkFailed, setChunkFailed] = useState(false);
  useEffect(() => {
    if (lens === DEFAULT_LENS || LensView || chunkFailed) return;
    let cancelled = false;
    import("./GraphLens")
      .then((mod) => !cancelled && setLensView(() => mod.default))
      .catch(() => !cancelled && setChunkFailed(true));
    return () => {
      cancelled = true;
    };
  }, [lens, LensView, chunkFailed, attempt]);
  const tryAgain = useCallback(() => {
    setChunkFailed(false);
    setAttempt((n) => n + 1);
    retry();
  }, [retry]);
  const label = LENSES.find((l) => l.id === lens)?.label ?? "";

  const choose = useCallback((next: LensId) => {
    setLens(next);
    setSwitched(true);
    const url = next === DEFAULT_LENS ? `${window.location.pathname}${window.location.search}` : `#lens=${next}`;
    window.history.replaceState(null, "", url);
  }, []);

  /** A switch caused by a link (not the switcher): show the section and move focus to the lens heading. */
  const followLink = useCallback((next: LensId) => {
    setLens(next);
    setSwitched(true);
    focusAfterSwitch.current = true;
    requestAnimationFrame(() => scrollToSection("work"));
  }, []);

  // Hash: on load, on back/forward and typed URLs.
  useEffect(() => {
    const sync = (initial: boolean) => {
      const hash = window.location.hash;
      const fromHash = lensFromHash(hash);
      if (fromHash) {
        if (initial) {
          setLens(fromHash);
          requestAnimationFrame(() => scrollToSection("work"));
        } else followLink(fromHash);
        return;
      }
      if (hash.startsWith("#project-")) {
        setLens(DEFAULT_LENS);
        // If a Highlights filter hides the card, show every project first.
        const card = document.getElementById(hash.slice(1));
        if (!card || card.offsetParent === null) window.dispatchEvent(new Event(SHOW_ALL_PROJECTS));
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(hash.slice(1))));
        return;
      }
      if (!initial && hash === "") setLens(DEFAULT_LENS);
    };
    sync(true);
    const onHash = () => sync(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [followLink]);

  // In-page links to #lens=<id> fire no hashchange when the hash already matches; handle every such click.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      // "#lens=x" and, since V3, "/explore#lens=x" when we are already on /explore.
      const link = (event.target as Element | null)?.closest?.('a[href*="#lens="]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      const next = lensFromHash(url.hash);
      if (!next) return;
      event.preventDefault();
      window.history.pushState(null, "", next === DEFAULT_LENS ? `${window.location.pathname}${window.location.search}` : `#lens=${next}`);
      followLink(next);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [followLink]);

  // Print styles key off this attribute so Recruiter mode prints alone.
  useEffect(() => {
    document.documentElement.dataset.lens = lens;
    return () => {
      delete document.documentElement.dataset.lens;
    };
  }, [lens]);

  // After a link-driven switch, focus the lens heading (or Highlights' section heading) once it exists.
  useEffect(() => {
    if (!focusAfterSwitch.current) return;
    const target = lens === DEFAULT_LENS ? document.getElementById("work-heading") : headingRef.current;
    if (!target) return;
    focusAfterSwitch.current = false;
    target.focus({ preventScroll: true });
  }, [lens, graphState.status]);

  const errorMessage = () => (
    <p className="max-w-measure text-lg text-ink">
      This view could not load. Check your connection, then{" "}
      <button type="button" onClick={tryAgain} className="min-h-11 font-medium text-accent-2 underline decoration-1 underline-offset-4">
        try again
      </button>{" "}
      or{" "}
      <button type="button" onClick={() => choose(DEFAULT_LENS)} className="min-h-11 font-medium text-accent-2 underline decoration-1 underline-offset-4">
        show highlights
      </button>
      .
    </p>
  );
  const loading = <p className="text-muted">Loading {label.toLowerCase()}…</p>;

  return (
    <div data-switched={switched ? "" : undefined}>
      <div className="mb-10 md:mb-14 print:hidden">
        <LensSwitcher lens={lens} onChange={choose} />
        <p className="mt-3 text-sm text-muted">Six views of the same projects and roles. Recruiter is a one-page summary you can print.</p>
        <p className="sr-only" aria-live="polite">
          Showing {label}
        </p>
      </div>

      <div data-lens-panel="" hidden={lens !== DEFAULT_LENS}>
        {children}
      </div>

      {lens !== DEFAULT_LENS && (
        <div key={lens} data-lens-panel="" aria-busy={graphState.status === "loading"}>
          <h3 ref={headingRef} tabIndex={-1} className="sr-only">
            {label}
          </h3>
          {graphState.status === "error" || chunkFailed ? (
            errorMessage()
          ) : graphState.status === "ready" && LensView ? (
            <LensErrorBoundary key={attempt} fallback={errorMessage}>
              <LensView lens={lens} graph={graphState.graph} />
            </LensErrorBoundary>
          ) : (
            loading
          )}
        </div>
      )}
    </div>
  );
}
