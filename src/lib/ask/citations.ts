// Parses a generated answer into sentences with [node-id] citations. Only ids
// in the retrieved set survive; a sentence left with no valid citation is
// dropped, so nothing reaches the visitor that is not tied to a graph node.

export type CitedSentence = { text: string; citations: string[] };

const CITATION = /\[([a-z0-9][a-z0-9-]*)\]/g;
/** Sentence ends: . ! ? followed by optional citations, then whitespace or end. */
const SENTENCE = /[^.!?]+(?:[.!?]+(?:\s*\[[a-z0-9-]+\])*|$)/g;

// Dots that do not end a sentence (27.7%, 3.96, vs., e.g., i.e.) are shielded
// with a one-dot leader while splitting, then restored.
const SHIELD = "\u2024";
const shield = (s: string) => s.replace(/(\d)\.(?=\d)/g, `$1${SHIELD}`).replace(/\b(vs|e\.g|i\.e|etc|approx|no)\./gi, (m) => m.replace(/\./g, SHIELD));
const unshield = (s: string) => s.replaceAll(SHIELD, ".");

export function parseCitedAnswer(answer: string, allowed: ReadonlySet<string>): CitedSentence[] {
  const sentences = (shield(answer.replace(/\s+/g, " ").trim()).match(SENTENCE) ?? []).map(unshield);
  return sentences
    .map((raw) => {
      const ids = [...raw.matchAll(CITATION)].map((m) => m[1]);
      const citations = [...new Set(ids.filter((id) => allowed.has(id)))];
      const text = raw.replace(CITATION, "").replace(/\s+([.!?,;:])/g, "$1").replace(/\s+/g, " ").trim();
      return { text, citations };
    })
    .filter((s) => s.text.length > 0 && s.citations.length > 0);
}
