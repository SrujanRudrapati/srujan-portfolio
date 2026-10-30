import MiniSearch from "minisearch";
import { looksLikeInjection } from "./guard";
import { processTerm, queryTerms } from "./terms";
import { MAX_QUESTION } from "./limits";
import type { Hit, SearchDoc } from "./types";

// Retrieval over the graph's search index, entirely in the browser. MiniSearch
// ranks with BM25 over label (boosted), summary, tags, linked skills, metrics
// and body text. Visitor text is only ever a search query here: it is never
// executed, rendered as HTML, or sent anywhere.

export { MAX_QUESTION } from "./limits";
export { processTerm, queryTerms } from "./terms";
export const TOP_K = 6;
/** Below this BM25 score a hit is noise (a stray common word); calibrated in retrieve.test.ts. */
export const MIN_SCORE = 4;
/** With three or more search terms, a hit must match at least this share of them (stops one generic word carrying an off-topic question). */
export const MIN_COVERAGE = 0.34;
/** A hit must score at least this share of the best hit, so a stray shared word ("API" in "Flask API") does not ride along with strong matches. */
export const MIN_RELATIVE = 0.15;

/** Projects and roles carry the evidence; skill and metric nodes only point at them, so they rank lower. */
const TYPE_WEIGHT: Partial<Record<SearchDoc["type"], number>> = { project: 1, role: 1, education: 0.7, certification: 0.4, event: 0.7, problem: 0.6, industry: 0.6, metric: 0.3, skill: 0.25, artifact: 0.3 };

export type AskIndex = { search: MiniSearch<SearchDoc>; docs: Map<string, SearchDoc> };

export function buildIndex(docs: SearchDoc[]): AskIndex {
  const index = new MiniSearch<SearchDoc>({
    fields: ["label", "summary", "tags", "skills", "metrics", "text"],
    extractField: (doc, field) => {
      const value = doc[field as keyof SearchDoc];
      return Array.isArray(value) ? value.join(" ") : String(value ?? "");
    },
    processTerm,
    searchOptions: { boost: { label: 3, skills: 2, tags: 1.5 }, prefix: (t) => t.length >= 4, fuzzy: (t) => (t.length >= 6 ? 0.15 : false), combineWith: "OR" },
  });
  index.addAll(docs);
  // Results map back to the original documents: MiniSearch's stored fields go through extractField, which flattens arrays.
  return { search: index, docs: new Map(docs.map((d) => [d.id, d])) };
}

/** Top-k nodes above the score and coverage floors, or nothing for an instruction-shaped question. Metrics and skills rank below the projects and roles that carry them. */
export function retrieve(index: AskIndex, question: string, k = TOP_K): Hit[] {
  const q = question.slice(0, MAX_QUESTION);
  const terms = queryTerms(q);
  if (terms.length === 0 || looksLikeInjection(q)) return [];
  const minMatched = terms.length >= 3 ? Math.ceil(terms.length * MIN_COVERAGE) : 1;
  const weight = (type: SearchDoc["type"]) => TYPE_WEIGHT[type] ?? 0.6;
  return index.search
    .search(q)
    .filter((r) => r.queryTerms.length >= minMatched)
    .map((r) => {
      const doc = index.docs.get(String(r.id));
      return doc ? { ...doc, score: r.score * weight(doc.type) } : null;
    })
    .filter((h): h is Hit => !!h && h.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .filter((h, _, all) => h.score >= all[0].score * MIN_RELATIVE)
    .slice(0, k);
}
