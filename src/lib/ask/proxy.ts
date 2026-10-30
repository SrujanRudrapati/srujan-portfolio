import type { Hit } from "./types";

// The optional generation proxy (worker/). Off unless NEXT_PUBLIC_ASK_ENDPOINT
// is set at build time; with it unset this module makes no network calls.

export const ASK_ENDPOINT = (process.env.NEXT_PUBLIC_ASK_ENDPOINT ?? "").replace(/\/+$/, "");
const TIMEOUT_MS = 15_000;

export type ProxyNode = Pick<Hit, "id" | "type" | "label" | "summary" | "metrics" | "skills" | "text">;

/** Per-node body text sent to the proxy; the Worker rejects longer fields. */
const MAX_TEXT = 1_500;
export type ProxyAnswer = { answer: string; citations: string[] };

let health: Promise<boolean> | null = null;

/** GET /health once per page view; false when unset, unreachable, or not ok. */
export function proxyHealthy(): Promise<boolean> {
  if (!ASK_ENDPOINT) return Promise.resolve(false);
  health ??= fetch(`${ASK_ENDPOINT}/health`, { signal: AbortSignal.timeout(5_000) })
    .then((r) => r.ok)
    .catch(() => false);
  return health;
}

function isProxyAnswer(v: unknown): v is ProxyAnswer {
  return !!v && typeof v === "object" && typeof (v as ProxyAnswer).answer === "string" && Array.isArray((v as ProxyAnswer).citations);
}

/** POST /ask with the question and the retrieved nodes only. Resolves null on any failure, so callers fall back to retrieval. */
export async function askProxy(question: string, hits: Hit[]): Promise<ProxyAnswer | null> {
  if (!ASK_ENDPOINT || !(await proxyHealthy())) return null;
  const nodes: ProxyNode[] = hits.map(({ id, type, label, summary, metrics, skills, text }) => ({ id, type, label, summary, metrics, skills, text: text.slice(0, MAX_TEXT) }));
  try {
    const res = await fetch(`${ASK_ENDPOINT}/ask`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, nodes }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isProxyAnswer(data) ? data : null;
  } catch {
    return null;
  }
}
