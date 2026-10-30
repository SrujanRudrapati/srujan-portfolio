// The six lenses, in switcher order. `id` is what `#lens=<id>` carries.
export const LENSES = [
  { id: "highlights", label: "Highlights" },
  { id: "timeline", label: "Timeline" },
  { id: "skills", label: "Skill map" },
  { id: "problems", label: "By problem" },
  { id: "industries", label: "By industry" },
  { id: "recruiter", label: "Recruiter" },
] as const;

export type LensId = (typeof LENSES)[number]["id"];
export const DEFAULT_LENS = "highlights" satisfies LensId;

const ids = new Set<string>(LENSES.map((l) => l.id));
export const isLensId = (value: string): value is LensId => ids.has(value);

/** The lens named in a `#lens=<id>` hash, if any. */
export function lensFromHash(hash: string): LensId | null {
  const match = /^#lens=([a-z]+)$/.exec(hash);
  return match && isLensId(match[1]) ? match[1] : null;
}
