import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { authenticate, databaseError } from "@/lib/intelligence/server.server";
import { readCommand, reply, safeError } from "@/lib/intelligence/http.server";
const id = z.string().uuid(),
  text = z.string().trim().min(1);
export const workflowCommand = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("job.create"),
      kind: z.enum([
        "decision_research",
        "lead_research",
        "daily_brief",
        "hermes_plan",
      ]),
      topic: text.max(2000),
      business_id: id.nullable(),
      share_personal: z.boolean(),
      consent_ai: z.boolean(),
      request_key: id,
    })
    .strict(),
  z.object({ action: z.literal("job.cancel"), id }).strict(),
  z
    .object({
      action: z.literal("brief.schedule"),
      business_id: id,
      enabled: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal("campaign.create"),
      business_id: id,
      name: text.max(100),
    })
    .strict(),
  z
    .object({
      action: z.literal("draft.save"),
      campaign_id: id,
      id: id.nullable(),
      revision: z.number().int().min(1).nullable(),
      recipient: z.string().trim().email().max(254),
      company: text.max(200),
      subject: text.max(200).refine((s) => !/[\r\n]/.test(s)),
      body: text.max(10000),
    })
    .strict(),
  z
    .object({
      action: z.literal("draft.review"),
      id,
      revision: z.number().int().min(1),
      approve: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal("draft.review_many"),
      campaign_id: id,
      items: z
        .array(z.object({ id, revision: z.number().int().min(1) }).strict())
        .min(1)
        .max(50),
      approve: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal("campaign.permission"),
      id,
      revision: z.number().int().min(1),
      allow_send: z.boolean(),
      limit: z.number().int().min(0).max(50),
    })
    .strict(),
  z
    .object({
      action: z.literal("campaign.queue"),
      id,
      revision: z.number().int().min(1),
    })
    .strict(),
  z.object({ action: z.literal("campaign.cancel"), id }).strict(),
]);
async function capabilities(
  db: Awaited<ReturnType<typeof authenticate>>["db"],
  user: string
) {
  const { data, error } = await db
    .from("intelligence_runtime_health")
    .select("last_seen_at,capabilities")
    .eq("id", "worker")
    .maybeSingle();
  if (error) databaseError(error);
  const alive =
    !!data && Date.now() - new Date(data.last_seen_at).getTime() < 300000;
  const allowed = (process.env.INLITS_SEND_ALLOWED_USER_IDS || "")
    .split(",")
    .includes(user);
  return {
    worker: alive,
    ai: alive && data?.capabilities?.ai === true,
    hermes: alive && data?.capabilities?.hermes === true,
    briefs: alive && data?.capabilities?.briefs === true,
    sending: alive && data?.capabilities?.sending === true && allowed,
  };
}
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { db, user } = await authenticate(request);
    const tables = [
      "jobs",
      "leads",
      "campaigns",
      "outreach_drafts",
      "outreach_versions",
      "outbox",
      "schedules",
    ] as const;
    const rows = await Promise.all(
      tables.map((t) =>
        db
          .from(
            t === "campaigns"
              ? "intelligence_campaign_overview"
              : t === "outreach_versions"
              ? "intelligence_current_versions"
              : `intelligence_${t}`
          )
          .select(
            t === "outbox"
              ? "id,user_id,campaign_id,draft_id,revision,recipient,status,provider_id,error_code,created_at"
              : "*"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100)
      )
    );
    for (const row of rows) if (row.error) databaseError(row.error);
    return reply({
      ...Object.fromEntries(tables.map((t, i) => [t, rows[i].data || []])),
      capabilities: await capabilities(db, user.id),
    });
  } catch (error) {
    return safeError(error);
  }
}
export async function action({ request }: ActionFunctionArgs) {
  try {
    const input = await readCommand(request);
    const { db, user } = await authenticate(request);
    const parsed = workflowCommand.safeParse(input);
    if (!parsed.success)
      return reply({ error: "Please check the fields and permissions." }, 400);
    const c = parsed.data;
    let result;
    switch (c.action) {
      case "job.create": {
        const cap = await capabilities(db, user.id);
        if (
          !cap.worker ||
          ((c.kind === "decision_research" || c.kind === "lead_research") &&
            !cap.ai) ||
          (c.kind === "hermes_plan" && !cap.hermes) ||
          (c.kind === "daily_brief" && !cap.briefs)
        )
          return reply(
            {
              error:
                "This workflow is not connected to an active configured worker.",
            },
            503
          );
        result = await db.rpc("intelligence_enqueue", {
          kind: c.kind,
          topic: c.topic,
          business: c.business_id,
          share_personal: c.share_personal,
          consent_ai: c.consent_ai,
          request_key: c.request_key,
        });
        break;
      }
      case "job.cancel":
        result = await db.rpc("intelligence_cancel_job", { job: c.id });
        break;
      case "brief.schedule": {
        if (c.enabled && !(await capabilities(db, user.id)).briefs)
          return reply(
            { error: "A running worker is required before scheduling." },
            503
          );
        result = await db.rpc("intelligence_schedule_brief", {
          business: c.business_id,
          enabled: c.enabled,
        });
        break;
      }
      case "campaign.create":
        result = await db.rpc("intelligence_create_campaign", {
          business: c.business_id,
          title: c.name,
        });
        break;
      case "draft.save": {
        const origin = process.env.INLITS_PUBLIC_ORIGIN;
        if (!origin || !/^https:\/\/[^/]+$/.test(origin))
          return reply(
            {
              error:
                "Draft preparation requires the configured public HTTPS origin for an exact unsubscribe preview.",
            },
            503
          );
        result = await db.rpc("intelligence_save_outreach", {
          campaign: c.campaign_id,
          draft: c.id,
          expected_revision: c.revision,
          email: c.recipient,
          company: c.company,
          subject: c.subject,
          body: c.body,
          origin,
        });
        break;
      }
      case "draft.review_many":
        result = await db.rpc("intelligence_review_many", {
          campaign: c.campaign_id,
          items: c.items,
          approve: c.approve,
        });
        break;
      case "draft.review":
        result = await db.rpc("intelligence_review_outreach", {
          draft: c.id,
          expected_revision: c.revision,
          approve: c.approve,
        });
        break;
      case "campaign.permission": {
        if (c.allow_send && !(await capabilities(db, user.id)).sending)
          return reply(
            {
              error:
                "Sending is not configured for your account. Approval remains available.",
            },
            503
          );
        result = await db.rpc("intelligence_campaign_permission", {
          campaign: c.id,
          expected_revision: c.revision,
          allow_send: c.allow_send,
          recipient_limit: c.limit,
        });
        break;
      }
      case "campaign.queue": {
        if (!(await capabilities(db, user.id)).sending)
          return reply(
            { error: "Sending is unavailable for your account." },
            503
          );
        result = await db.rpc("intelligence_queue_campaign", {
          campaign: c.id,
          expected_revision: c.revision,
        });
        break;
      }
      case "campaign.cancel":
        result = await db.rpc("intelligence_cancel_campaign", {
          campaign: c.id,
        });
        break;
    }
    if (result?.error) {
      if (result.error.code === "P0001" || result.error.code === "P0002")
        return reply(
          {
            error:
              "The record or its permissions changed, or an allowance was reached. Reload and review the current state.",
          },
          409
        );
      databaseError(result.error);
    }
    return reply({ record: result?.data });
  } catch (error) {
    return safeError(error);
  }
}
