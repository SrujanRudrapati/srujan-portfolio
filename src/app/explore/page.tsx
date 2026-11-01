import type { Metadata } from "next";
import { Explore } from "@/components/explore/Explore";
import { RailBlock, RailHead, RailPage } from "@/components/site/Rail";
import { WorkIndex } from "@/components/work/WorkIndex";
import { cover } from "@/data/case-study";
import { projects } from "@/data/projects";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/explore", "Explore | Srujan Rudrapati", "The same work seen as a timeline, a skill map, by problem and by industry.");

// The v2 lenses (Highlights, Timeline, Skill map, By problem, By industry, Recruiter), unchanged
// in logic; switching between them is a Flip transition (V6). Highlights is the work index.
export default function ExplorePage() {
  const covers = Object.fromEntries(projects.map((p) => [p.slug, cover(p.slug)]));
  return (
    <RailPage>
      <RailHead stage="explore / views" title="Explore">
        <p>The same work, read different ways: as a timeline, a skill map, by the problem it solved, or by industry.</p>
      </RailHead>
      {/* #work is a direct child of main: the Recruiter lens's print rule keeps only it. */}
      <RailBlock id="work">
        <section aria-label="Lenses">
          <Explore>
            <WorkIndex projects={projects} covers={covers} />
          </Explore>
        </section>
      </RailBlock>
    </RailPage>
  );
}
