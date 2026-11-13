// Label Lens toy (pure): the made-up label, the allergy chips, and the warning, which must quote the label.

export type Allergen = "peanut" | "milk" | "soy" | "shellfish";
export const CHIPS: { key: Allergen; label: string }[] = [
  { key: "peanut", label: "Peanuts" },
  { key: "milk", label: "Milk" },
  { key: "soy", label: "Soy" },
  { key: "shellfish", label: "Shellfish" },
];
/** The made-up label, split so each allergen's words can be highlighted. */
export const LABEL: (string | { key: Allergen; text: string })[] = [
  "Ingredients: wheat flour, sugar, ",
  { key: "peanut", text: "peanut oil" },
  ", ",
  { key: "milk", text: "milk powder" },
  ", ",
  { key: "soy", text: "soy lecithin" },
  ", salt.",
];
export const IDLE_WARNING = "No warning without a quote from the label.";

export function warningFor(key: Allergen | null): string {
  if (!key) return IDLE_WARNING;
  const chip = CHIPS.find((c) => c.key === key)!.label.toLowerCase();
  const hit = LABEL.find((p): p is { key: Allergen; text: string } => typeof p !== "string" && p.key === key);
  return hit ? `Warning for ${chip}. The label says “${hit.text}”.` : `Nothing on this label to quote for ${chip}, so no warning.`;
}

