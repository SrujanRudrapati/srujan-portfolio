import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { Explore } from "@/components/explore/Explore";
import { WorkExplorer } from "@/components/work/WorkExplorer";
import { PageHead } from "@/components/site/PageHead";
import { projects } from "@/data/projects";

export const metadata: Metadata = pageMeta("/explore", "Explore | Srujan Rudrapati", "The same work seen as a timeline, a skill map, by problem and by industry.");

// The v2 lenses (Highlights, Timeline, Skill map, By problem, By industry, Recruiter), unchanged in logic.
export default function ExplorePage() {
  return (
    <main id="main">
      <PageHead stage="explore / views" title="Explore">
        <p>The same work, read different ways: as a timeline, a skill map, by the problem it solved, or by industry.</p>
      </PageHead>
      <section aria-label="Lenses" className="px-gutter pb-section">
        <div className="mx-auto max-w-page">
          <Explore>
            <WorkExplorer projects={projects} />
          </Explore>
        </div>
      </section>
    </main>
  );
}
