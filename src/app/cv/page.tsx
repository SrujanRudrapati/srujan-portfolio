import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { RecruiterLens } from "@/components/explore/RecruiterLens";
import { PageHead } from "@/components/site/PageHead";
import { graph } from "@/data/graph";
import { selectRecruiter } from "@/data/graph/lenses";

export const metadata: Metadata = pageMeta("/cv", "CV | Srujan Rudrapati", "One page: who, what, proof and contact, with the resume download. Prints to one page.");

// Recruiter mode as its own page: the v2 Recruiter lens, printable to one page.
export default function CvPage() {
  return (
    <main id="main" data-print="cv">
      <div className="print:hidden">
        <PageHead stage="cv / one page" title="CV" />
      </div>
      <section aria-label="Recruiter one-pager" className="px-gutter pb-section print:p-0">
        <div className="mx-auto max-w-page">
          <RecruiterLens sheet={selectRecruiter(graph)} />
        </div>
      </section>
    </main>
  );
}
