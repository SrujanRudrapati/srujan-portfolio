"use client";

import { useMemo } from "react";
import { selectByIndustry, selectByProblem, selectRecruiter, selectTimeline } from "@/data/graph/lenses";
import type { Graph } from "@/data/graph/types";
import { KeyedLens } from "./KeyedLens";
import type { LensId } from "./lenses";
import { RecruiterLens } from "./RecruiterLens";
import { SkillMapLens } from "./SkillMapLens";
import { TimelineLens } from "./TimelineLens";

// Everything the non-default lenses need, in one chunk that loads with graph.json.
export default function GraphLens({ lens, graph }: { lens: Exclude<LensId, "highlights">; graph: Graph }) {
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
