import Link from "next/link";
import type { Metadata } from "next";
import { PipelineGame } from "@/components/game/PipelineGame";
import { BackPill } from "@/components/shell/BackPill";
import { MAIN_PAGES } from "@/components/site/routes";

export const metadata: Metadata = { title: "Page not found | Srujan Rudrapati" };

// 404 (runbook v4 W7.2): the query ran, no row came back. The pages that do exist, then the
// "Clean the pipeline" game (also in the command palette), restyled in the v4 tokens.

const PAGES = [{ href: "/", label: "Home" }, ...MAIN_PAGES];

export default function NotFound() {
  return (
    <main id="main" className="page">
      <div className="wrap">
        <BackPill />
        <h1 tabIndex={-1} className="page-title">
          Row not found
        </h1>
        <pre className="nf-query">
          <code>{`select * from pages\nwhere path = current_path;\n\n0 rows returned.`}</code>
        </pre>
        <p className="page-intro">This page does not exist. These do:</p>
        <ul className="nf-pages">
          {PAGES.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="pill">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <section aria-labelledby="game-heading" className="nf-game">
          <h2 id="game-heading" className="nf-game-title">
            Clean the pipeline
          </h2>
          <PipelineGame />
        </section>
      </div>
    </main>
  );
}
