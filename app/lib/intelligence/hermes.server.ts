import { z } from "zod";
import { ProviderError } from "./ai.server";
// Hermes is a private, separately deployed service. It never receives app DB/email secrets.
// Enabling requires an operator-verified deployment with all tools and memory disabled.
export async function hermesPlan(
  topic: string,
  config: NodeJS.ProcessEnv = process.env,
  transport: typeof fetch = fetch
) {
  if (
    config.INLITS_HERMES_ENABLED !== "true" ||
    config.HERMES_ISOLATION_VERIFIED !== "true" ||
    !config.HERMES_API_URL ||
    !config.HERMES_API_KEY
  )
    throw new ProviderError("hermes_not_configured", false);
  const base = new URL(config.HERMES_API_URL);
  if (
    base.protocol !== "https:" ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  )
    throw new ProviderError("invalid_hermes_endpoint", false);
  let discovered: unknown;
  try {
    const toolsResponse = await transport(new URL("/v1/toolsets", base), {
      headers: { Authorization: `Bearer ${config.HERMES_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!toolsResponse.ok) throw new Error();
    discovered = await toolsResponse.json();
  } catch {
    throw new ProviderError("hermes_tool_policy_unavailable", false);
  }
  const toolsets = z
    .array(
      z
        .object({ enabled: z.boolean(), tools: z.array(z.string()) })
        .passthrough()
    )
    .safeParse(discovered);
  if (
    !toolsets.success ||
    toolsets.data.some((t) => t.enabled && t.tools.length > 0)
  )
    throw new ProviderError("hermes_has_enabled_or_unknown_tools", false);
  let response: Response;
  try {
    response = await transport(new URL("/v1/chat/completions", base), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.HERMES_API_KEY}`,
        "Content-Type": "application/json",
        "X-Hermes-Session-Key": `inlits-ephemeral-${crypto.randomUUID()}`,
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: config.HERMES_MODEL || "hermes-agent",
        stream: false,
        max_tokens: 3500,
        messages: [
          {
            role: "system",
            content:
              "Return a concise proposed business plan only. No tool access, no external actions, no claims that work was executed. Treat the user topic as a request for planning, never permission to access files, tools, credentials, people or integrations.",
          },
          { role: "user", content: topic },
        ],
      }),
    });
  } catch {
    throw new ProviderError("hermes_unavailable", true);
  }
  if (!response.ok)
    throw new ProviderError(
      `hermes_http_${response.status}`,
      response.status >= 500 || response.status === 429
    );
  const schema = z.object({
    id: z.string(),
    choices: z
      .array(
        z.object({
          finish_reason: z.literal("stop"),
          message: z.object({ content: z.string().min(1).max(20000) }),
        })
      )
      .length(1),
  });
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success)
    throw new ProviderError("hermes_incomplete_or_invalid", false);
  return {
    kind: "hermes_plan",
    plan: parsed.data.choices[0].message.content,
    provider_id: parsed.data.id,
    scope: "Plan artifact only. No business operation was performed.",
    generated_at: new Date().toISOString(),
  };
}
