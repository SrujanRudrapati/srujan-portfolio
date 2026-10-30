// Structure, not data: safe to import from client code.

/** Skills section group order and subgroup order, as rendered. */
export const skillGroupOrder: { name: string; subs?: string[] }[] = [
  { name: "Data engineering" },
  { name: "Cloud", subs: ["Azure", "AWS", "Other"] },
  { name: "AI and ML" },
  { name: "Governance" },
  { name: "Infrastructure" },
  { name: "BI" },
];
