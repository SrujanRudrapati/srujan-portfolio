// Visitor text is data, never instructions (runbook rule 11). This guard is
// shared by the browser (refuse before searching) and the Worker (strip and
// log before calling the model). Patterns target instruction-shaped text
// aimed at an assistant, not ordinary questions about the work.

const INJECTION: RegExp[] = [
  /\b(ignore|disregard|forget|override|bypass)\b[^.?!]{0,40}\b(instructions?|rules?|prompts?|guidelines?|system|above|previous|prior)\b/i,
  /\b(reveal|print|show|repeat|output|leak|tell me)\b[^.?!]{0,30}\b(system prompt|your (rules|instructions|prompt)|hidden (prompt|instructions))\b/i,
  /\byou are now\b|\bact as\b|\bpretend (to be|you are)\b|\bjailbreak\b|\bdeveloper mode\b|\bDAN\b/i,
  /<\/?\s*(system|assistant|user|instructions?)\s*>/i,
  /\b(new|updated) (instructions|rules|system prompt)\b/i,
];

export const looksLikeInjection = (text: string): boolean => INJECTION.some((p) => p.test(text));

/** Removes instruction-shaped spans; returns the cleaned text and whether anything was removed. */
export function stripInjection(text: string): { clean: string; stripped: boolean } {
  let clean = text;
  for (const p of INJECTION) clean = clean.replace(new RegExp(p.source, p.flags.includes("g") ? p.flags : `${p.flags}g`), " ");
  clean = clean.replace(/\s+/g, " ").trim();
  return { clean, stripped: clean !== text.replace(/\s+/g, " ").trim() };
}
