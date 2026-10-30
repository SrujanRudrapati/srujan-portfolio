import type { MetricNode } from "./types.ts";

/** A figure node. `value` keeps its marker ("~80%", "about 50%"); `valueLabel` is the small text beside it. */
export const metric = (id: string, value: string, valueLabel: string, summary: string, evidence: MetricNode["evidence"], tags: string[] = []): MetricNode => ({
  id: `metric-${id}`,
  type: "metric",
  label: `${value} ${valueLabel}`,
  summary,
  evidence,
  tags: ["metric", ...tags],
  value,
  valueLabel,
});
