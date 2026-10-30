"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { selectByIndustry, selectByProblem, selectRecruiter, selectTimeline } from "@/data/graph/lenses";
import type { Graph } from "@/data/graph/types";
import { useGraph } from "@/hooks/use-graph";
import { KeyedLens } from "./KeyedLens";
import { DEFAULT_LENS, LENSES, lensFromHash, type LensId } from "./lenses";
import { LensSwitcher } from "./LensSwitcher";
import { RecruiterLens } from "./RecruiterLens";
import { SkillMapLens } from "./SkillMapLens";
import { TimelineLens } from "./TimelineLens";

// The Work section's lens switcher. Highlights is the server-rendered default
// (children), complete without JavaScript and kept mounted so its filter state
// survives a round trip. The other lenses render from public/graph.json, which
// loads on first use. The lens lives in location.hash (#lens=timeline); a
// #project-<slug> hash switches back to Highlights so card links always land.

function GraphLens({ lens, graph }: { lens: Exclude<LensId, "highlights">; graph: Graph }) {
  const timeline = useMemo(() => (lens === "timeline" ? selectTimeline(graph) : []), [lens, graph]);
  switch (lens) {
    case "timeline":
      return <TimelineLens entries={timeline} />;
    case "skills":
      return <SkillMapLens graph={graph} />;
    case "problems":
      return <KeyedLens cards={selectByProblem(graph)} noun="problem solved" />;
    case "industries":
      return <KeyedLens cards={selectByIndustry(graph)} noun="industry" />;
    case "recruiter":
      return <RecruiterLens sheet={selectRecruiter(graph)} />;
  }
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

export function Explore({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<LensId>(DEFAULT_LENS);
  const graphState = useGraph(lens !== DEFAULT_LENS);
  const label = LENSES.find((l) => l.id === lens)?.label ?? "";

  // Follow the hash: on load, on back/forward, and when a link elsewhere on the page points at a lens or a project card.
  useEffect(() => {
    const sync = (initial: boolean) => {
      const hash = window.location.hash;
      const fromHash = lensFromHash(hash);
      if (fromHash) {
        setLens(fromHash);
        if (initial || fromHash !== DEFAULT_LENS) requestAnimationFrame(() => scrollToSection("work"));
        return;
      }
      if (hash.startsWith("#project-")) {
        setLens(DEFAULT_LENS);
        requestAnimationFrame(() => scrollToSection(hash.slice(1)));
      }
    };
    sync(true);
    const onHash = () => sync(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Print styles key off this attribute so Recruiter mode prints alone.
  useEffect(() => {
    document.documentElement.dataset.lens = lens;
    return () => {
      delete document.documentElement.dataset.lens;
    };
  }, [lens]);

  const choose = useCallback((next: LensId) => {
    setLens(next);
    const url = next === DEFAULT_LENS ? `${window.location.pathname}${window.location.search}` : `#lens=${next}`;
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <>
      <div className="mb-10 md:mb-14 print:hidden">
        <LensSwitcher lens={lens} onChange={choose} />
        <p className="sr-only" aria-live="polite">
          Showing {label}
        </p>
      </div>

      <div data-lens-panel="" hidden={lens !== DEFAULT_LENS}>
        {children}
      </div>

      {lens !== DEFAULT_LENS && (
        <div key={lens} data-lens-panel="" aria-busy={graphState.status === "loading"}>
          <h3 className="sr-only">{label}</h3>
          {graphState.status === "ready" ? (
            <GraphLens lens={lens} graph={graphState.graph} />
          ) : graphState.status === "error" ? (
            <p className="max-w-measure text-lg text-ink">
              This view could not load ({graphState.message}).{" "}
              <button type="button" onClick={() => choose(DEFAULT_LENS)} className="font-medium text-accent-2 underline decoration-1 underline-offset-4">
                Show highlights
              </button>
            </p>
          ) : (
            <p className="text-muted">Loading {label.toLowerCase()}…</p>
          )}
        </div>
      )}
    </>
  );
}
