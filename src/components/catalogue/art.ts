// The reference's gradient plates (design-direction "Art plates"): one per featured project,
// in catalogue order, and a plain dark plate for the smaller projects.
export const ART: readonly string[] = [
  "radial-gradient(120% 80% at 20% 15%,#C49A6C 0%,rgba(196,154,108,0) 55%),radial-gradient(90% 70% at 85% 80%,#5B4632 0%,rgba(91,70,50,0) 60%),linear-gradient(160deg,#1C2733,#0C1117)",
  "radial-gradient(100% 70% at 75% 20%,#9FB3C8 0%,rgba(159,179,200,0) 55%),radial-gradient(80% 60% at 20% 85%,#C49A6C 0%,rgba(196,154,108,0) 60%),linear-gradient(200deg,#18222D,#0C1117)",
  "conic-gradient(from 210deg at 60% 45%,#C49A6C,#E7D3B6,#7D5E40,#1C2733,#C49A6C)",
  "radial-gradient(70% 50% at 50% 30%,#D9E1EA 0%,rgba(217,225,234,0) 60%),repeating-linear-gradient(0deg,rgba(232,234,237,.07) 0 1px,transparent 1px 22px),linear-gradient(180deg,#1C2733,#0C1117)",
];
export const PLAIN_ART = "linear-gradient(160deg,#1A2430,#0F141A)";

export const artFor = (index: number | undefined): string => (index === undefined ? PLAIN_ART : (ART[index] ?? PLAIN_ART));

/** View-transition names shared by a project's card and its list row (runbook W3.5). */
export const vtNames = (i: number) => ({ item: `wi-${i}`, art: `wa-${i}`, name: `wn-${i}` });
