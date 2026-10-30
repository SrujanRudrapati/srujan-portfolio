import { useEffect, useState } from "react";
import type { Graph } from "@/data/graph/types";
import { withBasePath } from "@/lib/paths";

// Loads public/graph.json once per page view, on first use. The lenses other
// than Highlights render from it; the default lens never needs it.

export type GraphState = { status: "idle" | "loading" } | { status: "ready"; graph: Graph } | { status: "error"; message: string };

let pending: Promise<Graph> | null = null;

function isGraph(value: unknown): value is Graph {
  if (!value || typeof value !== "object") return false;
  const { nodes, edges } = value as { nodes?: unknown; edges?: unknown };
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return false;
  const nodeOk = (n: unknown) => !!n && typeof n === "object" && typeof (n as { id?: unknown }).id === "string" && typeof (n as { type?: unknown }).type === "string";
  const edgeOk = (e: unknown) => !!e && typeof e === "object" && typeof (e as { from?: unknown }).from === "string" && typeof (e as { to?: unknown }).to === "string";
  return nodes.every(nodeOk) && edges.every(edgeOk);
}

function loadGraph(): Promise<Graph> {
  pending ??= fetch(withBasePath("/graph.json"))
    .then((res) => {
      if (!res.ok) throw new Error(`graph.json returned ${res.status}`);
      return res.json() as Promise<unknown>;
    })
    .then((data) => {
      if (!isGraph(data)) throw new Error("graph.json is not a graph");
      return data;
    })

  return pending;
}

type Result = { status: "ready"; graph: Graph } | { status: "error"; message: string };

/** idle until enabled; loading until the fetch settles; then ready or error for the rest of the page view (no retry loop). */
export function useGraph(enabled: boolean): GraphState {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!enabled || result) return;
    let cancelled = false;
    loadGraph()
      .then((graph) => {
        if (!cancelled) setResult({ status: "ready", graph });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ status: "error", message: error instanceof Error ? error.message : "Unknown error" });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, result]);

  if (result?.status === "ready") return result;
  if (!enabled) return { status: "idle" };
  return result ?? { status: "loading" };
}
