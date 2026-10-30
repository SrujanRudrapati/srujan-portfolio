import { withBasePath } from "@/lib/paths";
import { summaryLine } from "./answer";
import { parseCitedAnswer, type CitedSentence } from "./citations";
import { askProxy } from "./proxy";
import type { AskIndex } from "./retrieve";
import { isSearchDocs, type Hit } from "./types";

// Loads the index once (search-index.json plus MiniSearch, both on first use)
// and answers a question: retrieval always, generation only when the proxy is
// configured and healthy, and only sentences that cite retrieved nodes.

export type AskResult =
  | { kind: "evidence"; question: string; summary: string; hits: Hit[]; generated: CitedSentence[] }
  | { kind: "none"; question: string };

export { ASK_ENDPOINT } from "./proxy";

let indexPromise: Promise<{ index: AskIndex; retrieve: (typeof import("./retrieve"))["retrieve"] }> | null = null;

export function loadIndex() {
  indexPromise ??= Promise.all([fetch(withBasePath("/search-index.json")).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`search-index.json returned ${r.status}`)))), import("./retrieve")])
    .then(([data, mod]: [unknown, typeof import("./retrieve")]) => {
      if (!isSearchDocs(data)) throw new Error("search-index.json is malformed");
      return { index: mod.buildIndex(data), retrieve: mod.retrieve };
    })
    .catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

/** Retrieval only: instant, never waits on the network beyond the local index. */
export async function retrieveAnswer(question: string): Promise<AskResult> {
  const { index, retrieve } = await loadIndex();
  const hits = retrieve(index, question);
  if (hits.length === 0) return { kind: "none", question };
  return { kind: "evidence", question, summary: summaryLine(hits, question), hits, generated: [] };
}

/** The optional generated paragraph: only sentences citing the retrieved nodes; empty when the proxy is off or fails. */
export async function generateFor(question: string, hits: Hit[]): Promise<CitedSentence[]> {
  const proxied = await askProxy(question, hits);
  return proxied ? parseCitedAnswer(proxied.answer, new Set(hits.map((h) => h.id))) : [];
}

/** Both steps, for callers that want one promise (tests). */
export async function ask(question: string): Promise<AskResult> {
  const result = await retrieveAnswer(question);
  return result.kind === "evidence" ? { ...result, generated: await generateFor(question, result.hits) } : result;
}
