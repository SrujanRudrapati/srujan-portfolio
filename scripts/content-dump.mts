// Plain-text render of every project and experience entry, for proofreading
// (runbook Phases 4 and 5). Usage: npm run content:dump
// Imports are relative so Node can run this without the "@/" alias.

import { projects } from "../src/data/projects.ts";
import { experience } from "../src/content/portfolio.ts";

const lines: string[] = [];
const out = (s = "") => lines.push(s);

for (const p of projects) {
  out(`## ${p.title}`);
  out(`status: ${p.status}${p.featured ? " (featured)" : ""}`);
  if (p.date) out(`date: ${p.date}`);
  if (p.context) out(`context: ${p.context}`);
  out(`one-liner: ${p.oneLiner}`);
  for (const m of p.impact) out(`impact: ${m.value} ${m.label}`);
  if (p.problem) out(`problem: ${p.problem}`);
  if (p.built) out(`built: ${p.built}`);
  for (const h of p.highlights) out(`highlight: ${h}`);
  if (p.details) {
    out(`${p.details.heading}:`);
    for (const d of p.details.items) out(`  - ${d.name}: ${d.text}`);
  }
  for (const n of p.statusNotes ?? []) out(`status note (${n.state}): ${n.text}`);
  if (p.statusDetail) out(`status detail: ${p.statusDetail}`);
  if (p.credit) out(`credit: ${p.credit}`);
  out(`stack: ${p.stack.join(", ")}`);
  for (const [k, v] of Object.entries(p.links)) {
    if (k === "more") for (const link of v as { label: string; url: string }[]) out(`link: ${link.label}: ${link.url}`);
    else if (k === "repoLabel") continue;
    else out(`link ${k}: ${v}`);
  }
  if (p.diagram) out(`diagram: ${[p.diagram, ...(p.secondaryDiagrams ?? [])].join(", ")}`);
  out();
}

for (const r of experience) {
  out(`## ${r.title}, ${r.org}`);
  out(`place: ${r.place}`);
  out(`dates: ${r.dates}`);
  if (r.summary) out(`summary: ${r.summary}`);
  for (const o of r.outcomes) out(`- ${o.label ? `${o.label}: ` : ""}${o.text}`);
  out();
}

process.stdout.write(lines.join("\n") + "\n");
