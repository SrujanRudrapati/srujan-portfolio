import type { NodeType } from "@/data/graph/types";

/** One document in public/search-index.json (written by scripts/build-graph.mts). */
export type SearchDoc = {
  id: string;
  type: NodeType;
  label: string;
  summary: string;
  tags: string[];
  evidence: string[];
  metrics: string;
  skills: string;
  text: string;
};

export type Hit = SearchDoc & { score: number };

export function isSearchDocs(value: unknown): value is SearchDoc[] {
  return (
    Array.isArray(value) &&
    value.every(
      (d) =>
        !!d &&
        typeof d === "object" &&
        typeof (d as SearchDoc).id === "string" &&
        typeof (d as SearchDoc).label === "string" &&
        typeof (d as SearchDoc).summary === "string" &&
        Array.isArray((d as SearchDoc).tags) &&
        Array.isArray((d as SearchDoc).evidence),
    )
  );
}
