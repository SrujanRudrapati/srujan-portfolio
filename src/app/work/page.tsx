import type { Metadata } from "next";
import { RailBlock, RailHead, RailPage } from "@/components/site/Rail";
import { WorkIndex } from "@/components/work/WorkIndex";
import { cover } from "@/data/case-study";
import { projects } from "@/data/projects";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/work", "Work | Srujan Rudrapati", "Every project: the featured four first, then the rest. Filter by production, AI, data engineering or hackathon.");

// The project index (runbook V6): featured large with their 3D covers, the rest compact,
// filterable. Each item opens its case study, where the detail lives (V5).
export default function WorkPage() {
  const covers = Object.fromEntries(projects.map((p) => [p.slug, cover(p.slug)]));
  return (
    <RailPage>
      <RailHead stage="stage 02 / transform" title="Work" />
      <RailBlock>
        <WorkIndex projects={projects} covers={covers} />
      </RailBlock>
    </RailPage>
  );
}
