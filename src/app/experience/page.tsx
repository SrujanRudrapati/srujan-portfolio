import type { Metadata } from "next";
import { Timeline } from "@/components/experience/Timeline";
import { BackPill } from "@/components/shell/BackPill";
import { dateToYear, defaultItemId, timeline } from "@/data/experience";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/experience", "Experience | Srujan Rudrapati", "Every role on one timeline, from Celebal Technologies to ASU Surplus.");

// Runbook v4 W5: the Experience timeline. The roles and the milestone come from the graph.
export default function ExperiencePage() {
  const items = timeline();
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          Experience
        </h1>
        <p className="page-intro">Every role on one timeline. Select a bar to read what happened there.</p>
        <Timeline items={items} defaultId={defaultItemId(items)} builtAt={dateToYear(new Date())} />
      </div>
    </main>
  );
}
