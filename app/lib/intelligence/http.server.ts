import { json } from "@remix-run/node";
import { privateHeaders } from "./server.server";
export function reply(body: unknown, status = 200) {
  return json(body, { status, headers: privateHeaders });
}
export async function readCommand(
  request: Request,
  limit = 24000
): Promise<unknown> {
  if (request.method !== "POST")
    throw reply({ error: "Method not allowed." }, 405);
  if (request.headers.get("Origin") !== new URL(request.url).origin)
    throw reply({ error: "Unrecognized request origin." }, 403);
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    throw reply({ error: "Use JSON." }, 415);
  const reader = request.body?.getReader();
  if (!reader) throw reply({ error: "Empty request." }, 400);
  const decoder = new TextDecoder();
  let body = "",
    size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw reply({ error: "Request is too large." }, 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(body);
  } catch {
    throw reply({ error: "Invalid JSON." }, 400);
  }
}
export function safeError(error: unknown) {
  return error instanceof Response
    ? error
    : reply(
        {
          error:
            "The operation could not be completed. Please retry or reload.",
        },
        500
      );
}
