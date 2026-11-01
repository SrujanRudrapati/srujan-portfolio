import type { Metadata } from "next";
import { artFor } from "@/components/catalogue/art";
import { Explore } from "@/components/explore/Explore";
import { BackPill } from "@/components/shell/BackPill";
import { WorkIndex } from "@/components/work/WorkIndex";
import { projects } from "@/data/projects";
import { workItems } from "@/data/work";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/explore", "Explore | Srujan Rudrapati", "The same work seen as a timeline, a skill map, by problem and by industry.");

// The v2 lenses (Highlights, Timeline, Skill map, By problem, By industry, Recruiter), unchanged in
// logic, in the v4 page frame (runbook W7, DECISIONS 23). Highlights is the work index with filters;
// the featured projects show their catalogue art plate instead of the v3 3D cover.
export default function ExplorePage() {
  const arts = Object.fromEntries(workItems().filter((w) => w.featured).map((w) => [w.slug, artFor(w.art)]));
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          Explore
        </h1>
        <p className="page-intro">The same work, read different ways: as a timeline, a skill map, by the problem it solved, or by industry.</p>
        {/* #work is a direct child of .wrap: the Recruiter lens’s print rule keeps only it. */}
        <section id="work" aria-label="Lenses">
          <Explore>
            <WorkIndex projects={projects} arts={arts} />
          </Explore>
        </section>
      </div>
    </main>
  );
}
