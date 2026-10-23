import type { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { verifyMailWebhook } from "@/lib/intelligence/mail.server";
import { serviceDatabase } from "@/lib/intelligence/service.server";
import { reply } from "@/lib/intelligence/http.server";
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST")
    return reply({ error: "Method not allowed" }, 405);
  if (!process.env.RESEND_WEBHOOK_SECRET)
    return reply({ error: "Webhook not configured" }, 503);
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "Missing payload" }, 400);
  let raw = "",
    size = 0;
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > 100000) {
        await reader.cancel();
        return reply({ error: "Payload too large" }, 413);
      }
      raw += decoder.decode(part.value, { stream: true });
    }
    raw += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  if (
    !verifyMailWebhook(raw, request.headers, process.env.RESEND_WEBHOOK_SECRET)
  )
    return reply({ error: "Invalid signature" }, 401);
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return reply({ error: "Invalid payload" }, 400);
  }
  const parsed = z
    .object({
      type: z.string(),
      data: z.object({ email_id: z.string() }).passthrough(),
    })
    .passthrough()
    .safeParse(value);
  if (!parsed.success) return reply({ error: "Invalid event" }, 400);
  try {
    const db = serviceDatabase();
    const { data, error } = await db.rpc("intelligence_mail_event", {
      event_id: request.headers.get("svix-id"),
      email_id: parsed.data.data.email_id,
      event_type: parsed.data.type,
    });
    if (error || !data)
      return reply({ error: "Event awaiting reconciliation" }, 503);
    return reply({ received: true });
  } catch {
    return reply({ error: "Event persistence unavailable" }, 503);
  }
}
