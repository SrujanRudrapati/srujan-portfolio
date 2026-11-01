import Link from "next/link";
import type { Metadata } from "next";
import { PipelineGame } from "@/components/game/PipelineGame";
import { RailBlock, RailHead, RailPage, RailSection } from "@/components/site/Rail";

export const metadata: Metadata = { title: "Page not found | Srujan Rudrapati" };

// 404 in the Pipeline's language (V3): the query ran, no row came back. V6 puts it on the
// rail and adds the "Clean the pipeline" game (also in the command palette).

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
];

export default function NotFound() {
  return (
    <RailPage>
      <RailHead stage="stage 04 / query" title="Row not found" />
      <RailBlock>
        <pre className="max-w-full overflow-x-auto border-l-2 border-accent-2 bg-surface p-5 font-mono text-sm text-ink">
          <code>{`select * from pages\nwhere path = current_path;\n\n0 rows returned.`}</code>
        </pre>
        <p className="mt-8 max-w-measure text-lg text-ink">This page does not exist. These do:</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {PAGES.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex min-h-11 min-w-11 items-center justify-center font-medium">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </RailBlock>
      <RailSection id="game" stage="query / game" title="Clean the pipeline">
        <PipelineGame />
      </RailSection>
    </RailPage>
  );
}
