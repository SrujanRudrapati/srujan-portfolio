// Cloudflare Worker entry: wires the Anthropic SDK into the pure handler.
// Model: the current Sonnet (runbook: "claude-sonnet-4-6 or whatever is
// current"), effort low for short grounded answers, with the server-side
// refusal fallback enabled.

import Anthropic from "@anthropic-ai/sdk";
import { createHandler, ModelError, type CallModel } from "./handler";

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 1_024;
/** The browser gives up at 15 s, so the Worker stops before it and retries at most once. */
const TIMEOUT_MS = 12_000;

function modelCaller(env: Env): CallModel {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: TIMEOUT_MS, maxRetries: 1 });
  return async (system, user) => {
    let response;
    try {
      response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user }],
      });
    } catch (error: unknown) {
      // Most specific first (claude-api skill): each maps to a distinct, logged outcome.
      if (error instanceof Anthropic.RateLimitError) throw new ModelError("upstream rate limit", 429);
      if (error instanceof Anthropic.AuthenticationError) throw new ModelError("upstream authentication failed (check ANTHROPIC_API_KEY)", 502);
      if (error instanceof Anthropic.APIConnectionError) throw new ModelError("upstream connection failed or timed out", 502);
      if (error instanceof Anthropic.APIError) throw new ModelError(`upstream error ${error.status ?? "unknown"}`, 502);
      throw error;
    }
    if (response.stop_reason === "refusal") return { text: "", refused: true };
    const text = response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
    return { text, refused: false };
  };
}

let handler: ((request: Request) => Promise<Response>) | null = null;

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    handler ??= createHandler({
      callModel: modelCaller(env),
      allowedOrigin: env.ALLOWED_ORIGIN,
      log: (message, data) => console.warn(JSON.stringify({ message, data })),
    });
    return handler(request);
  },
};

export default worker;
