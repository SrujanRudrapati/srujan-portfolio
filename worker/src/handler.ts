// Request handling for the Ask proxy, free of SDK and runtime imports so it is
// unit-tested with a fake model (handler.test.ts). index.ts wires in the
// Anthropic client. Guardrails, in order: CORS to one origin, method and path,
// rate limit per IP, body shape and size, instruction stripping (logged, never
// obeyed), then the model, then citations checked against the supplied nodes.

import { parseCitedAnswer } from "../../src/lib/ask/citations";
import { stripInjection } from "../../src/lib/ask/guard";
import { MAX_QUESTION } from "../../src/lib/ask/limits";
import { leaksSystemPrompt, NOT_IN_PORTFOLIO, SYSTEM_PROMPT, userTurn, type GraphNodeInput } from "./prompt";

export type CallModel = (system: string, user: string) => Promise<{ text: string; refused: boolean }>;

/** Thrown by CallModel for an upstream failure; `status` is what the Worker returns (429 for upstream rate limits, 502 otherwise). */
export class ModelError extends Error {
  constructor(
    message: string,
    readonly status: 429 | 502,
  ) {
    super(message);
  }
}
export type HandlerDeps = { callModel: CallModel; allowedOrigin: string; now?: () => number; log?: (message: string, data?: unknown) => void };

const MAX_NODES = 6;
const MAX_BODY_BYTES = 32 * 1024;
const MAX_FIELD = 2_000;
export const RATE_LIMIT = { requests: 20, windowMs: 60 * 60 * 1000 };

type AskBody = { question: string; nodes: GraphNodeInput[] };
const str = (v: unknown, max = MAX_FIELD): v is string => typeof v === "string" && v.length <= max;

function parseBody(value: unknown): AskBody | string {
  if (!value || typeof value !== "object") return "body must be a JSON object";
  const { question, nodes } = value as { question?: unknown; nodes?: unknown };
  if (!str(question, MAX_QUESTION) || question.trim() === "") return `question must be 1 to ${MAX_QUESTION} characters`;
  if (!Array.isArray(nodes) || nodes.length === 0 || nodes.length > MAX_NODES) return `nodes must be 1 to ${MAX_NODES} entries`;
  const optional = (v: unknown) => v === undefined || str(v);
  const ok = nodes.every((n) => n && typeof n === "object" && str(n.id, 120) && /^[a-z0-9-]+$/.test(n.id) && str(n.type, 40) && str(n.label, 300) && str(n.summary) && str(n.metrics) && optional(n.skills) && optional(n.text));
  if (!ok) return "each node needs id, type, label, summary and metrics strings (skills and text optional)";
  return { question, nodes: nodes.map(({ id, type, label, summary, metrics, skills, text }: GraphNodeInput) => ({ id, type, label, summary, metrics, skills, text })) };
}

/** Reads the body up to `max` bytes; null if it is longer (covers chunked bodies with no content-length). */
async function readCapped(request: Request, max: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

/** In-memory sliding window per IP. Per isolate, so approximate; a KV namespace would make it global (see DECISIONS). */
export function createRateLimiter(now: () => number) {
  const hits = new Map<string, number[]>();
  return (ip: string): boolean => {
    const t = now();
    // Sweep expired windows so the map does not grow with every IP ever seen.
    for (const [key, times] of hits) if (times.every((x) => t - x >= RATE_LIMIT.windowMs)) hits.delete(key);
    const recent = (hits.get(ip) ?? []).filter((x) => t - x < RATE_LIMIT.windowMs);
    if (recent.length >= RATE_LIMIT.requests) {
      hits.set(ip, recent);
      return false;
    }
    hits.set(ip, [...recent, t]);
    return true;
  };
}

export function createHandler({ callModel, allowedOrigin, now = Date.now, log = () => undefined }: HandlerDeps) {
  const allow = createRateLimiter(now);
  const cors = (origin: string | null): Record<string, string> =>
    origin === allowedOrigin ? { "access-control-allow-origin": allowedOrigin, "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "origin" } : { vary: "origin" };
  const json = (data: unknown, status: number, origin: string | null) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...cors(origin) } });

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    if (request.method === "OPTIONS") return new Response(null, { status: origin === allowedOrigin ? 204 : 403, headers: cors(origin) });
    if (request.method === "GET" && url.pathname === "/health") return json({ ok: true }, 200, origin);
    if (request.method !== "POST" || url.pathname !== "/ask") return json({ error: "not found" }, 404, origin);
    if (origin !== allowedOrigin) return json({ error: "origin not allowed" }, 403, origin);

    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    if (!allow(ip)) return json({ error: "rate limited, try again later" }, 429, origin);

    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return json({ error: "body too large" }, 413, origin);
    const text = await readCapped(request, MAX_BODY_BYTES);
    if (text === null) return json({ error: "body too large" }, 413, origin);
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return json({ error: "body must be JSON" }, 400, origin);
    }
    const body = parseBody(raw);
    if (typeof body === "string") return json({ error: body }, 400, origin);

    const { clean, stripped } = stripInjection(body.question);
    if (stripped) log("stripped instruction-shaped text from a question", { ip, original: body.question.slice(0, MAX_QUESTION) });
    // Nothing real left to ask once the instructions are gone (fragments like "prompt"): refuse without calling the model.
    const words = clean.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const enough = stripped ? words.filter((w) => w.length > 3).length >= 2 : words.length > 0;
    if (!enough) return json({ answer: NOT_IN_PORTFOLIO, citations: [] }, 200, origin);

    let result: { text: string; refused: boolean };
    try {
      result = await callModel(SYSTEM_PROMPT, userTurn(clean, body.nodes));
    } catch (error: unknown) {
      const status = error instanceof ModelError ? error.status : 502;
      log("model call failed", { status, message: error instanceof Error ? error.message : String(error) });
      return json({ error: status === 429 ? "busy, try again later" : "generation unavailable" }, status, origin);
    }
    if (result.refused) return json({ answer: NOT_IN_PORTFOLIO, citations: [] }, 200, origin);
    if (leaksSystemPrompt(result.text)) {
      log("refused a reply that repeats the system prompt");
      return json({ answer: NOT_IN_PORTFOLIO, citations: [] }, 200, origin);
    }

    // Keep only sentences that cite a supplied node; never echo anything else (including any prompt text).
    const allowed = new Set(body.nodes.map((n) => n.id));
    const sentences = parseCitedAnswer(result.text, allowed);
    if (sentences.length === 0) return json({ answer: NOT_IN_PORTFOLIO, citations: [] }, 200, origin);
    const answer = sentences.map((s) => `${s.text} ${s.citations.map((c) => `[${c}]`).join("")}`).join(" ");
    const citations = [...new Set(sentences.flatMap((s) => s.citations))];
    return json({ answer, citations }, 200, origin);
  };
}
