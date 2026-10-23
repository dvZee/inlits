import { createHmac, timingSafeEqual } from "node:crypto";
export function verifyMailWebhook(
  raw: string,
  headers: Headers,
  secret: string,
  now = Date.now()
) {
  const id = headers.get("svix-id"),
    ts = headers.get("svix-timestamp"),
    signatures = headers.get("svix-signature");
  if (
    !id ||
    !ts ||
    !signatures ||
    !/^\d+$/.test(ts) ||
    Math.abs(now / 1000 - Number(ts)) > 300
  )
    return false;
  const expected = createHmac(
    "sha256",
    Buffer.from(secret.replace(/^whsec_/, ""), "base64")
  )
    .update(`${id}.${ts}.${raw}`)
    .digest();
  return signatures.split(" ").some((value) => {
    const [version, digest] = value.split(",");
    if (version !== "v1" || !digest) return false;
    try {
      const actual = Buffer.from(digest, "base64");
      return (
        actual.length === expected.length && timingSafeEqual(actual, expected)
      );
    } catch {
      return false;
    }
  });
}
export function sendingConfigured(config: NodeJS.ProcessEnv) {
  try {
    const origin = new URL(config.INLITS_PUBLIC_ORIGIN || "");
    return (
      config.INLITS_SEND_ENABLED === "true" &&
      !!config.RESEND_API_KEY &&
      !!config.RESEND_FROM &&
      !/[\r\n]/.test(config.RESEND_FROM) &&
      origin.protocol === "https:" &&
      origin.origin === config.INLITS_PUBLIC_ORIGIN &&
      !!config.INLITS_SEND_ALLOWED_USER_IDS &&
      !!config.RESEND_WEBHOOK_SECRET
    );
  } catch {
    return false;
  }
}
export async function sendOne(
  db: import("@supabase/supabase-js").SupabaseClient,
  config: NodeJS.ProcessEnv = process.env,
  transport: typeof fetch = fetch
) {
  if (!sendingConfigured(config)) return false;
  const claim = await db.rpc("intelligence_claim_outreach");
  if (claim.error) throw new Error("outreach_claim_failed");
  const message = claim.data?.[0];
  if (!message) return false;
  const allowed = (config.INLITS_SEND_ALLOWED_USER_IDS || "")
    .split(",")
    .includes(message.user_id);
  if (!allowed) {
    await db
      .from("intelligence_outbox")
      .update({ status: "failed", error_code: "sender_not_allowed" })
      .eq("id", message.id)
      .eq("status", "dispatching");
    return true;
  }
  const { data: version, error } = await db
    .from("intelligence_outreach_versions")
    .select("*")
    .eq("draft_id", message.draft_id)
    .eq("revision", message.revision)
    .single();
  if (error || !version) {
    await db
      .from("intelligence_outbox")
      .update({ status: "failed", error_code: "version_missing" })
      .eq("id", message.id);
    return true;
  }
  // Recheck after claim; an edit/revocation before this point prevents provider dispatch.
  const { data: campaign, error: campaignError } = await db
    .from("intelligence_campaigns")
    .select("cancelled,revision,permission_revision,permission_expires_at")
    .eq("id", message.campaign_id)
    .single();
  const currentDraft = await db
    .from("intelligence_outreach_drafts")
    .select("review,revision,approved_revision")
    .eq("id", message.draft_id)
    .single();
  const suppression = await db
    .from("intelligence_suppressions")
    .select("recipient")
    .eq("user_id", message.user_id)
    .eq("recipient", message.recipient)
    .maybeSingle();
  if (
    campaignError ||
    currentDraft.error ||
    !currentDraft.data ||
    currentDraft.data.review !== "approved" ||
    currentDraft.data.revision !== message.revision ||
    currentDraft.data.approved_revision !== message.revision ||
    suppression.error ||
    !campaign ||
    campaign.cancelled ||
    campaign.revision !== campaign.permission_revision ||
    !campaign.permission_expires_at ||
    new Date(campaign.permission_expires_at).getTime() <= Date.now() ||
    suppression.data
  ) {
    await db
      .from("intelligence_outbox")
      .update({
        status: "cancelled",
        error_code: "permission_or_suppression_changed",
      })
      .eq("id", message.id)
      .eq("status", "dispatching");
    return true;
  }
  const origin = new URL(config.INLITS_PUBLIC_ORIGIN!);
  if (origin.protocol !== "https:")
    throw new Error("mail_origin_must_be_https");
  if (version.public_origin !== origin.origin)
    throw new Error("approved_message_origin_changed");
  try {
    const response = await transport("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `inlits-${message.id}`,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        from: config.RESEND_FROM,
        to: [message.recipient],
        subject: version.subject,
        text: version.final_body,
      }),
    });
    if (!response.ok) {
      const safeFailure = [400, 401, 403, 404, 422, 429].includes(
        response.status
      );
      const update = await db
        .from("intelligence_outbox")
        .update({
          status: safeFailure ? "failed" : "unknown",
          error_code: `provider_http_${response.status}`,
        })
        .eq("id", message.id)
        .eq("status", "dispatching");
      if (update.error) throw new Error();
      return true;
    }
    const result = await response.json();
    if (typeof result.id !== "string") throw new Error();
    const saved = await db
      .from("intelligence_outbox")
      .update({ status: "accepted", provider_id: result.id, error_code: null })
      .eq("id", message.id)
      .eq("status", "dispatching");
    if (saved.error) throw new Error();
  } catch {
    // Ambiguous network or persistence outcome: never automatically resend after provider acceptance.
    const update = await db
      .from("intelligence_outbox")
      .update({ status: "unknown", error_code: "provider_outcome_unknown" })
      .eq("id", message.id)
      .eq("status", "dispatching");
    if (update.error) throw new Error("unknown_outcome_persistence_failed");
  }
  return true;
}
