import type { Metadata } from "next";
import { RecruiterLens } from "@/components/explore/RecruiterLens";
import { RailBlock, RailHead, RailPage } from "@/components/site/Rail";
import { graph } from "@/data/graph";
import { selectRecruiter } from "@/data/graph/lenses";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta("/cv", "CV | Srujan Rudrapati", "One page: who, what, proof and contact, with the resume download. Prints to one page.");

// Recruiter mode as its own page (V6: in the concept's type, still plain and printable to one
// page). The rail and page header are screen only; the print rule on main[data-print="cv"] keeps the sheet.
export default function CvPage() {
  return (
    <RailPage print="cv">
      <div className="print:hidden">
        <RailHead stage="cv / one page" title="CV" />
      </div>
      <RailBlock>
        <section aria-label="Recruiter one-pager">
          <RecruiterLens sheet={selectRecruiter(graph)} level={2} />
        </section>
      </RailBlock>
    </RailPage>
  );
}
