// Cloudflare Worker entry: wires the Anthropic SDK into the pure handler.
// Model: the current Sonnet (runbook: "claude-sonnet-4-6 or whatever is
// current"), effort low for short grounded answers, with the server-side
// refusal fallback enabled.

import Anthropic from "@anthropic-ai/sdk";
import { createHandler, type CallModel } from "./handler";

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 1_024;

function modelCaller(env: Env): CallModel {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return async (system, user) => {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user }],
    });
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
