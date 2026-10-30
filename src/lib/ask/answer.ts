import type { Hit } from "./types";

// The evidence answer: a one-line summary built from a template, never from
// generated text, and the in-page anchor each card links to.

const NOUN: Record<string, [string, string]> = {
  project: ["project", "projects"],
  role: ["role", "roles"],
  education: ["degree", "degrees"],
  certification: ["certification", "certifications"],
  skill: ["skill", "skills"],
  metric: ["result", "results"],
  industry: ["industry", "industries"],
  problem: ["problem", "problems"],
  artifact: ["link", "links"],
  event: ["event", "events"],
};

const ORDER = ["project", "role", "metric", "skill", "education", "certification", "problem", "industry", "event", "artifact"];

/** "3 projects and 1 role match; strongest evidence: Surplus AI (~80% less processing time per item...)." */
export function summaryLine(hits: Hit[]): string {
  if (hits.length === 0) return "";
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(h.type, (counts.get(h.type) ?? 0) + 1);
  const parts = ORDER.filter((t) => counts.has(t)).map((t) => {
    const n = counts.get(t)!;
    const [one, many] = NOUN[t] ?? [t, `${t}s`];
    return `${n} ${n === 1 ? one : many}`;
  });
  const list = parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  const top = hits[0];
  const figure = top.metrics.split("; ")[0];
  return `${list} ${hits.length === 1 ? "matches" : "match"}; strongest evidence: ${top.label}${figure ? ` (${figure})` : ""}.`;
}

/** Where a node lives on the page. */
export function anchorFor(hit: Pick<Hit, "id" | "type" | "evidence">): string {
  switch (hit.type) {
    case "project":
      return `#${hit.id}`;
    case "role":
    case "education":
      return "#lens=timeline";
    case "skill":
      return "#lens=skills";
    case "problem":
      return "#lens=problems";
    case "industry":
      return "#lens=industries";
    case "certification":
      return "#credentials";
    default:
      return hit.evidence.find((u) => u.startsWith("#")) ?? "#work";
  }
}

/** Off-page evidence: repos and live apps. Root paths are left for the caller to prefix with withBasePath. */
export const externalEvidence = (hit: Pick<Hit, "evidence">): string[] => hit.evidence.filter((u) => /^https?:\/\//.test(u) || u.startsWith("/"));
