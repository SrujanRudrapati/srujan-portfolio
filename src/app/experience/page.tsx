import type { Metadata } from "next";
import { Experience } from "@/components/Experience";
import { BackPill } from "@/components/shell/BackPill";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/experience", "Experience | Srujan Rudrapati", "Every role, from Celebal Technologies to ASU Surplus.");

// Interim (W2): the v3 Experience list in the v4 page frame, so the home tile has a page.
// Phase W5 replaces it with the timeline chart.
export default function ExperiencePage() {
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          Experience
        </h1>
        <Experience />
      </div>
    </main>
  );
}
