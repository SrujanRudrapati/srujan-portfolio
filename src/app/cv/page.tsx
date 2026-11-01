import type { Metadata } from "next";
import { RecruiterLens } from "@/components/explore/RecruiterLens";
import { BackPill } from "@/components/shell/BackPill";
import { graph } from "@/data/graph";
import { selectRecruiter } from "@/data/graph/lenses";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/cv", "CV | Srujan Rudrapati", "One page: who, what, proof and contact, with the resume download. Prints to one page.");

// Runbook v4 W7.1: the one-pager keeps its content and takes the v4 tokens on screen, on a rounded
// sheet. The back pill and title are screen only; main[data-print="cv"] prints the sheet alone, black
// on white, on one page (print rules in globals.css).
export default function CvPage() {
  return (
    <main id="main" className="page" data-print="cv">
      <div className="wrap">
        <div className="print:hidden">
          <BackPill />
          <h1 tabIndex={-1} className="page-title">
            CV
          </h1>
          <p className="page-intro">The whole picture on one page. Print it, or download the resume.</p>
        </div>
        <div className="cv-sheet">
          <RecruiterLens sheet={selectRecruiter(graph)} level={2} />
        </div>
      </div>
    </main>
  );
}
