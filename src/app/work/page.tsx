import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { PageHead } from "@/components/site/PageHead";
import { WorkExplorer } from "@/components/work/WorkExplorer";
import { projects } from "@/data/projects";

export const metadata: Metadata = pageMeta("/work", "Work | Srujan Rudrapati", "Every project: the featured four first, then the rest. Filter by production, AI, data engineering or hackathon.");

// The project index (runbook V3): featured large, others compact, filterable. Each card opens /work/[slug].
export default function WorkPage() {
  return (
    <main id="main">
      <PageHead stage="stage 02 / transform" title="Work" />
      <section id="work" aria-label="Projects" className="px-gutter pb-section">
        <div className="mx-auto max-w-page">
          <WorkExplorer projects={projects} />
        </div>
      </section>
    </main>
  );
}
