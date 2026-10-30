// Validates the knowledge graph and emits public/graph.json and
// public/search-index.json (runbook Phase 6, step 3). Runs as `prebuild`, so
// `npm run build` fails on a broken graph. Node 22 type stripping, no deps.
//
//   npm run graph           # same as prebuild
//
// The emitted files are committed: the Pages workflow runs `next build`
// directly (not `npm run build`), so it serves whatever was generated locally.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/data/graph.ts";
import type { Edge, GraphNode } from "../src/data/graph.ts";

const ALLOWED: Record<Edge["type"], { from: GraphNode["type"][]; to: GraphNode["type"][] }> = {
  uses: { from: ["project", "role"], to: ["skill"] },
  achieved: { from: ["project", "role"], to: ["metric"] },
  solved: { from: ["project", "role"], to: ["problem"] },
  in: { from: ["project", "role"], to: ["industry"] },
  at: { from: ["project"], to: ["role", "education"] },
  produced: { from: ["project", "role"], to: ["artifact"] },
  during: { from: ["project", "event"], to: ["role", "education"] },
};

const sentences = (text: string) => text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).filter(Boolean).length;

function validate(): string[] {
  const errors: string[] = [];
  const byId = new Map<string, GraphNode>();
  for (const n of graph.nodes) {
    if (byId.has(n.id)) errors.push(`duplicate node id "${n.id}"`);
    byId.set(n.id, n);
    if (!n.summary.trim()) errors.push(`node "${n.id}" has no summary`);
    else if (sentences(n.summary) > 2) errors.push(`node "${n.id}" summary has more than two sentences`);
    if (!n.label.trim()) errors.push(`node "${n.id}" has no label`);
    if (!Array.isArray(n.evidence)) errors.push(`node "${n.id}" has no evidence array`);
    if (n.type === "metric") {
      const quoted = /^".+"$/.test(n.value) || /^'.+'$/.test(n.value);
      if (!/\d/.test(n.value) && !quoted) errors.push(`metric "${n.id}" value "${n.value}" is neither numeric nor quoted`);
      if (!n.valueLabel.trim()) errors.push(`metric "${n.id}" has an empty valueLabel`);
      if (n.evidence.length === 0) errors.push(`metric "${n.id}" has no evidence link`);
    }
    for (const d of [n.dates?.start, n.dates?.end]) {
      if (d !== undefined && !/^\d{4}(-\d{2})?$/.test(d)) errors.push(`node "${n.id}" date "${d}" is not YYYY or YYYY-MM`);
    }
    if (n.dates && !n.dates.start && !n.dates.end) errors.push(`node "${n.id}" has an empty dates object`);
    if (n.type === "project" && n.evidence.length === 0) errors.push(`project "${n.id}" has no evidence link`);
    for (const ev of n.evidence) {
      if (!ev.label?.trim()) errors.push(`node "${n.id}" has an evidence entry with no label`);
      if (!ev.url || !(ev.url.startsWith("#") || ev.url.startsWith("/") || /^https?:\/\//.test(ev.url))) errors.push(`node "${n.id}" evidence url "${ev.url}" is not a fragment, root path or http(s) URL`);
    }
    if (/[–—]/.test(`${n.label} ${n.summary}`)) errors.push(`node "${n.id}" contains an em or en dash`);
  }
  for (const e of graph.edges) {
    const from = byId.get(e.from);
    const to = byId.get(e.to);
    if (!from) errors.push(`edge ${e.type} from unknown node "${e.from}"`);
    if (!to) errors.push(`edge ${e.type} to unknown node "${e.to}"`);
    if (!from || !to) continue;
    const rule = ALLOWED[e.type];
    if (!rule.from.includes(from.type) || !rule.to.includes(to.type)) errors.push(`edge ${e.type} ${e.from} -> ${e.to}: ${from.type} -> ${to.type} is not allowed`);
    if (e.chip !== undefined && e.type !== "uses") errors.push(`edge ${e.type} ${e.from} -> ${e.to}: "chip" only applies to uses edges`);
    if (e.label !== undefined && e.type !== "uses") errors.push(`edge ${e.type} ${e.from} -> ${e.to}: "label" only applies to uses edges`);
    if (e.metric !== undefined) {
      if (e.type !== "solved") errors.push(`edge ${e.type} ${e.from} -> ${e.to}: "metric" only applies to solved edges`);
      else if (!graph.edges.some((a) => a.type === "achieved" && a.from === e.from && a.to === e.metric)) errors.push(`edge solved ${e.from} -> ${e.to}: metric "${e.metric}" is not achieved by ${e.from}`);
    }
  }
  // Projects, metrics, industries and problems only mean something through
  // their edges. Skills the section lists but no project uses, certifications,
  // events and the internship role may stand alone.
  const referenced = new Set(graph.edges.flatMap((e) => [e.from, e.to]));
  for (const n of graph.nodes) {
    if (!referenced.has(n.id) && ["project", "metric", "industry", "problem"].includes(n.type)) errors.push(`node "${n.id}" (${n.type}) has no edges`);
  }
  return errors;
}

type SearchDoc = { id: string; type: GraphNode["type"]; label: string; summary: string; tags: string[]; evidence: string[]; metrics: string };

function searchIndex(): SearchDoc[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return graph.nodes.map((n) => {
    const metrics = graph.edges
      .filter((e) => e.type === "achieved" && e.from === n.id)
      .map((e) => byId.get(e.to))
      .filter((m): m is Extract<GraphNode, { type: "metric" }> => !!m && m.type === "metric")
      .map((m) => `${m.value} ${m.valueLabel}`)
      .join("; ");
    return { id: n.id, type: n.type, label: n.label, summary: n.summary, tags: n.tags, evidence: n.evidence.map((ev) => ev.url), metrics };
  });
}

const errors = validate();
if (errors.length > 0) {
  console.error(`✗ graph validation failed with ${errors.length} error(s):`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

const publicDir = join(process.cwd(), "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "graph.json"), JSON.stringify(graph, null, 2) + "\n");
writeFileSync(join(publicDir, "search-index.json"), JSON.stringify(searchIndex(), null, 2) + "\n");

const counts = graph.nodes.reduce<Record<string, number>>((acc, n) => ({ ...acc, [n.type]: (acc[n.type] ?? 0) + 1 }), {});
console.log(`✓ graph ok: ${graph.nodes.length} nodes (${Object.entries(counts).map(([t, c]) => `${t} ${c}`).join(", ")}), ${graph.edges.length} edges → public/graph.json, public/search-index.json`);
