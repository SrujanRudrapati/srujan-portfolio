// Tokenising shared by indexing, querying and the answer template. No
// MiniSearch import, so the template stays out of the lazy search chunk.

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

/** Terms of the question that survive stop-word filtering. Empty means there is nothing to search for. */
export const queryTerms = (question: string): string[] =>
  question
    .split(/\s+/)
    .map(processTerm)
    .filter((t): t is string => !!t);
