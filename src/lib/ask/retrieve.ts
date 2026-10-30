import MiniSearch from "minisearch";
import { looksLikeInjection } from "./guard";
import { MAX_QUESTION } from "./limits";
import type { Hit, SearchDoc } from "./types";

// Retrieval over the graph's search index, entirely in the browser. MiniSearch
// ranks with BM25 over label (boosted), summary, tags, linked skills, metrics
// and body text. Visitor text is only ever a search query here: it is never
// executed, rendered as HTML, or sent anywhere.

export { MAX_QUESTION } from "./limits";
export const TOP_K = 6;
/** Below this BM25 score a hit is noise (a stray common word); calibrated in retrieve.test.ts. */
export const MIN_SCORE = 4;
/** With three or more search terms, a hit must match at least this share of them (stops one generic word carrying an off-topic question). */
export const MIN_COVERAGE = 0.34;

/** Projects and roles carry the evidence; skill and metric nodes only point at them, so they rank lower. */
const TYPE_WEIGHT: Partial<Record<SearchDoc["type"], number>> = { project: 1, role: 1, education: 0.7, certification: 0.7, event: 0.7, problem: 0.6, industry: 0.6, metric: 0.3, skill: 0.25, artifact: 0.3 };

export type AskIndex = { search: MiniSearch<SearchDoc>; docs: Map<string, SearchDoc> };

const STOP = new Set(
  (
    "a about after all also an and any are as at be been but by can could did do does done for from get got had has have he her him his how i if in into " +
    "is it its just me more most my no not of on or our out over please show so some something than that the their them then there these they this to " +
    "up us use used uses using was we were what when where which who why will with work worked works would you your yours tell give list any anything " +
    "srujan rudrapati he's you've i've we've project projects role roles"
  ).split(/\s+/),
);

/** Lower-cases, strips punctuation, drops stop words; shared by indexing and querying. */
export function processTerm(term: string): string | null {
  const t = term.toLowerCase().replace(/[^\p{L}\p{N}+#./-]+/gu, "").replace(/^[./-]+|[./-]+$/g, "");
  return t.length < 2 || STOP.has(t) ? null : t;
}

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

/** Terms of the question that survive stop-word filtering. Empty means there is nothing to search for. */
export const queryTerms = (question: string): string[] =>
  question
    .split(/\s+/)
    .map(processTerm)
    .filter((t): t is string => !!t);

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
    .slice(0, k);
}
