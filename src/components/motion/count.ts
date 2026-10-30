/** Splits "~80%", "about 10 million", "1st", "44/44" into a countable number and its fixed text. */
export function parseCount(value: string): { prefix: string; n: number; decimals: number; suffix: string } | null {
  const match = value.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const raw = match[2].replace(/,/g, "");
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return { prefix: match[1], n, decimals: raw.includes(".") ? raw.split(".")[1].length : 0, suffix: match[3] };
}

/** The interim text for a count at value v: same prefix and suffix, so the width barely moves. */
export function formatCount(parts: NonNullable<ReturnType<typeof parseCount>>, v: number): string {
  const num = v.toLocaleString("en-US", { minimumFractionDigits: parts.decimals, maximumFractionDigits: parts.decimals });
  return `${parts.prefix}${num}${parts.suffix}`;
}
