import { queryTerms } from "./terms";
import type { Hit } from "./types";

// The evidence answer: a one-line summary built from a template, never from
// generated text, and the in-page anchor each card links to.

const NOUN: Record<string, [string, string]> = {
  project: ["project", "projects"],
  role: ["role", "roles"],
  education: ["degree", "degrees"],
  certification: ["certification", "certifications"],
  skill: ["skill", "skills"],
  metric: ["figure", "figures"],
  industry: ["industry", "industries"],
  problem: ["problem", "problems"],
  artifact: ["link", "links"],
  event: ["event", "events"],
};

const ORDER = ["project", "role", "metric", "skill", "education", "certification", "problem", "industry", "event", "artifact"];

/** The top node's figure that shares a word with the question, if any. Never an unrelated lead figure. */
function relevantFigure(hit: Hit, question: string): string | undefined {
  const terms = queryTerms(question);
  return hit.metrics
    .split("; ")
    .filter(Boolean)
    .find((figure) => {
      const words = new Set(queryTerms(figure));
      return terms.some((t) => words.has(t));
    });
}

/** "3 projects and 1 role match; strongest evidence: Surplus AI (~80% less processing time per item...)." */
export function summaryLine(hits: Hit[], question = ""): string {
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
  const figure = relevantFigure(top, question);
  return `${list} ${hits.length === 1 ? "matches" : "match"}; strongest evidence: ${top.label}${figure ? ` (${figure})` : ""}.`;
}

/** Where a node lives on the site: a route path, without the GitHub Pages basePath (render it through withBasePath). */
export function anchorFor(hit: Pick<Hit, "id" | "type" | "evidence">): string {
  switch (hit.type) {
    case "project":
      return `/work/${hit.id.replace(/^project-/, "")}`;
    case "role":
      return "/experience"; // v4: the Experience timeline
    case "education":
      return "/about#credentials";
    case "skill":
      return "/explore#lens=skills";
    case "problem":
      return "/explore#lens=problems";
    case "industry":
      return "/explore#lens=industries";
    case "certification":
      return "/about#credentials";
    default:
      return hit.evidence.find((u) => isRoute(u)) ?? "/work";
  }
}

/** A page on this site ("/work/label-lens", "/about#skills"), as opposed to a file ("/resume.pdf") or another site. */
export const isRoute = (u: string): boolean => u.startsWith("/") && !/^\/[^#?]*\.[a-z0-9]+([#?].*)?$/i.test(u);

/** Evidence that is not a page here: repos, live apps, files. Root paths are left for the caller to prefix with withBasePath. */
export const externalEvidence = (hit: Pick<Hit, "evidence">): string[] => hit.evidence.filter((u) => /^https?:\/\//.test(u) || (u.startsWith("/") && !isRoute(u)));
