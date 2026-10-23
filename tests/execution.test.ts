import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createHmac } from "node:crypto";
import {
  openAIResponse,
  synthesizeDecision,
  qualifyLeads,
  publicUrl,
} from "../app/lib/intelligence/ai.server";
import { verifyMailWebhook } from "../app/lib/intelligence/mail.server";
import { hermesPlan } from "../app/lib/intelligence/hermes.server";
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
async function database() {
  const db = new PGlite();
  await db.exec(
    `create role authenticated;create role anon;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`
  );
  for (const name of [
    "20261023180000_intelligence_foundation.sql",
    "20261023190000_execution_engine.sql",
    "20261023200000_outreach_approvals.sql",
    "20261023210000_privacy_controls.sql",
  ])
    await db.exec(
      await readFile(
        new URL(`../supabase/migrations/${name}`, import.meta.url),
        "utf8"
      )
    );
  await db.query("insert into auth.users values($1),($2)", [a, b]);
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}'`);
  return db;
}
test("persistent queue enforces quotas, idempotency, cancellation, leases and private context boundaries", async () => {
  const db = await database();
  try {
    const business = (
      await db.query<{ id: string }>(
        `insert into intelligence_business_workspaces(user_id,name,business_type,goal) values($1,'Test','services','Grow') returning id`,
        [a]
      )
    ).rows[0].id;
    await db.query(
      `insert into intelligence_personal_facts(user_id,label,value,kind,consented_at) values($1,'Goal','Private','fact',now())`,
      [a]
    );
    const key = crypto.randomUUID();
    const enqueue = () =>
      db.query<{
        intelligence_enqueue: { id: string; input: { context: unknown[] } };
      }>(
        "select to_jsonb(intelligence_enqueue($1,$2,$3,$4,$5,$6)) as intelligence_enqueue",
        ["decision_research", "Research a choice", null, true, true, key]
      );
    const first = (await enqueue()).rows[0].intelligence_enqueue;
    assert.equal(first.input.context.length, 1);
    assert.equal((await enqueue()).rows[0].intelligence_enqueue.id, first.id);
    await assert.rejects(
      db.query(
        "select to_jsonb(intelligence_enqueue($1,$2,$3,$4,$5,$6)) as intelligence_enqueue",
        [
          "lead_research",
          "Public market",
          business,
          true,
          true,
          crypto.randomUUID(),
        ]
      )
    );
    await assert.rejects(
      db.query(`update intelligence_jobs set status='completed'`)
    );
    await db.exec("set role service_role");
    const job = (await db.query<any>("select * from intelligence_claim_job()"))
      .rows[0];
    assert.equal(job.id, first.id);
    assert.equal(
      (
        await db.query<any>("select intelligence_finish_job($1,$2,$3,$4,$5)", [
          job.id,
          crypto.randomUUID(),
          { artifact: "fake" },
          null,
          false,
        ])
      ).rows[0].intelligence_finish_job,
      false
    );
    await db.exec(`set role authenticated;set request.jwt.claim.sub='${b}'`);
    assert.equal(
      (await db.query("select * from intelligence_jobs")).rows.length,
      0
    );
    assert.equal(
      (await db.query<any>("select intelligence_cancel_job($1)", [job.id]))
        .rows[0].intelligence_cancel_job,
      false
    );
    await assert.rejects(db.query("select * from intelligence_claim_job()"));
    await db.exec(`set request.jwt.claim.sub='${a}'`);
    await db.query("select intelligence_cancel_job($1)", [job.id]);
    await db.exec("set role service_role");
    assert.equal(
      (
        await db.query<any>("select intelligence_finish_job($1,$2,$3,$4,$5)", [
          job.id,
          job.lease_token,
          { artifact: "late" },
          null,
          false,
        ])
      ).rows[0].intelligence_finish_job,
      false
    );
    await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}'`);
    for (let i = 0; i < 9; i++)
      await db.query(
        "select to_jsonb(intelligence_enqueue($1,$2,$3,$4,$5,$6)) as intelligence_enqueue",
        ["daily_brief", "Brief", business, false, false, crypto.randomUUID()]
      );
    await assert.rejects(
      db.query(
        "select to_jsonb(intelligence_enqueue($1,$2,$3,$4,$5,$6)) as intelligence_enqueue",
        ["daily_brief", "Brief", business, false, false, crypto.randomUUID()]
      )
    );
    await db.query("select intelligence_schedule_brief($1,true)", [business]);
    await db.exec("set role service_role");
    assert.equal(
      (await db.query<any>("select intelligence_tick_schedules()")).rows[0]
        .intelligence_tick_schedules,
      0
    );
    await db.exec(
      "update intelligence_jobs set status='cancelled' where kind='daily_brief';update intelligence_schedules set next_run_at=now();"
    );
    assert.equal(
      (await db.query<any>("select intelligence_tick_schedules()")).rows[0]
        .intelligence_tick_schedules,
      1
    );
    assert.equal(
      (await db.query<any>("select intelligence_tick_schedules()")).rows[0]
        .intelligence_tick_schedules,
      0
    );
  } finally {
    await db.close();
  }
});
test("outreach separates review and permission, freezes revisions, suppresses recipients, and prevents duplicate dispatch", async () => {
  const db = await database();
  try {
    const business = (
      await db.query<{ id: string }>(
        `insert into intelligence_business_workspaces(user_id,name,business_type,goal) values($1,'Test','services','Grow') returning id`,
        [a]
      )
    ).rows[0].id;
    const campaign = (
      await db.query<any>(
        "select to_jsonb(intelligence_create_campaign($1,$2)) as intelligence_create_campaign",
        [business, "Test campaign"]
      )
    ).rows[0].intelligence_create_campaign;
    const draft = (
      await db.query<any>(
        "select to_jsonb(intelligence_save_outreach($1,$2,$3,$4,$5,$6,$7,$8)) as intelligence_save_outreach",
        [
          campaign.id,
          null,
          null,
          "Person@Example.com",
          "Example",
          "Hello",
          "An explicit draft",
          "https://inlits.test",
        ]
      )
    ).rows[0].intelligence_save_outreach;
    assert.equal(draft.recipient, "person@example.com");
    await db.query("select intelligence_review_outreach($1,$2,true)", [
      draft.id,
      1,
    ]);
    await assert.rejects(
      db.query("select intelligence_queue_campaign($1,$2)", [campaign.id, 2])
    );
    await db.query("select intelligence_campaign_permission($1,$2,true,$3)", [
      campaign.id,
      2,
      1,
    ]);
    await db.query("select intelligence_queue_campaign($1,$2)", [
      campaign.id,
      2,
    ]);
    await db.query("select intelligence_queue_campaign($1,$2)", [
      campaign.id,
      2,
    ]);
    assert.equal(
      (await db.query("select * from intelligence_outbox")).rows.length,
      1
    );
    const edited = (
      await db.query<any>(
        "select to_jsonb(intelligence_save_outreach($1,$2,$3,$4,$5,$6,$7,$8)) as intelligence_save_outreach",
        [
          campaign.id,
          draft.id,
          1,
          "other@example.com",
          "Example",
          "Edited",
          "Needs approval again",
          "https://inlits.test",
        ]
      )
    ).rows[0].intelligence_save_outreach;
    assert.equal(edited.review, "pending");
    assert.equal(edited.revision, 2);
    assert.equal(
      (await db.query<any>("select * from intelligence_outbox")).rows[0].status,
      "cancelled"
    );
    assert.equal(
      (
        await db.query<any>(
          "select * from intelligence_outreach_versions where revision=1"
        )
      ).rows[0].recipient,
      "person@example.com"
    );
    await assert.rejects(
      db.query("update intelligence_outreach_versions set body='tampered'")
    );
    await assert.rejects(
      db.query("select intelligence_review_outreach($1,1,true)", [draft.id])
    );
    await db.query("select intelligence_review_outreach($1,2,true)", [
      draft.id,
    ]);
    await db.query("select intelligence_campaign_permission($1,3,true,1)", [
      campaign.id,
    ]);
    await db.query("select intelligence_queue_campaign($1,3)", [campaign.id]);
    await db.exec("set role service_role");
    const send = (
      await db.query<any>("select * from intelligence_claim_outreach()")
    ).rows[0];
    assert.equal(send.recipient, "other@example.com");
    assert.equal(
      (await db.query("select * from intelligence_claim_outreach()")).rows
        .length,
      0
    );
    await db.query(
      "update intelligence_outbox set provider_id='provider_test',status='accepted' where id=$1",
      [send.id]
    );
    assert.equal(
      (
        await db.query<any>(
          "select intelligence_mail_event('evt1','provider_test','email.delivered')"
        )
      ).rows[0].intelligence_mail_event,
      true
    );
    assert.equal(
      (
        await db.query<any>(
          "select intelligence_mail_event('evt1','provider_test','email.delivered')"
        )
      ).rows[0].intelligence_mail_event,
      true
    );
    assert.equal(
      (
        await db.query<any>(
          "select status from intelligence_outbox where id=$1",
          [send.id]
        )
      ).rows[0].status,
      "delivered"
    );
    await db.query(
      "select intelligence_mail_event('evt2','provider_test','email.bounced')"
    );
    await db.query(
      "select intelligence_mail_event('evt3','provider_test','email.delivered')"
    );
    assert.equal(
      (
        await db.query<any>(
          "select status from intelligence_outbox where id=$1",
          [send.id]
        )
      ).rows[0].status,
      "bounced"
    );
    await db.query("select intelligence_unsubscribe($1)", [
      send.unsubscribe_token,
    ]);
    assert.equal(
      (await db.query("select * from intelligence_suppressions")).rows.length,
      1
    );
    await db.exec(`set role authenticated;set request.jwt.claim.sub='${b}'`);
    for (const t of [
      "campaigns",
      "outreach_drafts",
      "outreach_versions",
      "outbox",
      "suppressions",
      "audit_events",
    ])
      assert.equal(
        (await db.query(`select * from intelligence_${t}`)).rows.length,
        0
      );
  } finally {
    await db.close();
  }
});
const envelope = (text: string, extra: Record<string, unknown> = {}) =>
  new Response(
    JSON.stringify({
      id: "resp_test",
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text }] }],
      ...extra,
    }),
    { status: 200 }
  );
test("AI adapters handle refusals, incomplete and invalid output, and block fabricated evidence", async () => {
  await assert.rejects(
    openAIResponse(
      { key: "test", model: "test", input: "x" },
      async () => new Response("", { status: 429 })
    ),
    /provider_http_429/
  );
  await assert.rejects(
    openAIResponse({ key: "test", model: "test", input: "x" }, async () =>
      envelope("x", { status: "incomplete" })
    ),
    /provider_incomplete/
  );
  await assert.rejects(
    openAIResponse({ key: "test", model: "test", input: "x" }, async () =>
      envelope("x", {
        output: [
          { type: "message", content: [{ type: "refusal", text: "No" }] },
        ],
      })
    ),
    /provider_refused/
  );
  const research = {
    text: "Evidence",
    sources: [{ url: "https://example.com/source", title: "Source" }],
    provider_id: "research",
    usage: {},
  };
  const output = {
    recommendation: "A",
    why: ["Fits"],
    options: [
      { name: "A", fit: "Fits", tradeoff: "Cost" },
      { name: "B", fit: "Cheap", tradeoff: "Time" },
    ],
    recommended_index: 0,
    uncertainties: ["Needs testing"],
    next_step: "Test",
    source_urls: ["https://invented.test/"],
  };
  await assert.rejects(
    synthesizeDecision(
      "Topic",
      [],
      research,
      { key: "test", model: "test" },
      async () => envelope(JSON.stringify(output))
    ),
    /unverified_source/
  );
  const good = await synthesizeDecision(
    "Topic",
    [],
    research,
    { key: "test", model: "test" },
    async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body.tools, []);
      assert.equal(body.store, false);
      assert.equal(body.text.format.strict, true);
      return envelope(
        JSON.stringify({
          ...output,
          source_urls: ["https://example.com/source"],
        })
      );
    }
  );
  assert.equal(good.recommended_index, 0);
  const qualified = await qualifyLeads(
    "Companies",
    research,
    { key: "test", model: "test" },
    async () =>
      envelope(
        JSON.stringify({
          leads: [
            {
              company: "Example",
              website: "https://example.com",
              qualification: "Relevant",
              source_url: "https://example.com/source",
            },
            {
              company: "Duplicate",
              website: "https://www.example.com/other",
              qualification: "Relevant",
              source_url: "https://example.com/source",
            },
          ],
          limitations: [],
        })
      )
  );
  assert.equal(qualified.leads.length, 1);
  for (const url of [
    "javascript:alert(1)",
    "http://example.com",
    "https://127.0.0.1",
    "https://user:secret@example.com",
    "https://[::1]/",
  ])
    assert.equal(publicUrl(url), false);
});
test("Hermes is disabled without operator-verified isolation, and rejects unfinished plans", async () => {
  await assert.rejects(hermesPlan("Goal", {}), /hermes_not_configured/);
  await assert.rejects(
    hermesPlan(
      "Goal",
      {
        INLITS_HERMES_ENABLED: "true",
        HERMES_ISOLATION_VERIFIED: "true",
        HERMES_API_URL: "https://hermes.example.com",
        HERMES_API_KEY: "test",
      },
      async (url) =>
        String(url).endsWith("/v1/toolsets")
          ? new Response("[]")
          : new Response(
              JSON.stringify({
                id: "run",
                choices: [
                  { finish_reason: "length", message: { content: "Partial" } },
                ],
              })
            )
    ),
    /hermes_incomplete/
  );
});
test("mail webhook checks signature and freshness", () => {
  const raw = '{"type":"email.delivered"}',
    secret = Buffer.from("test-webhook-key").toString("base64"),
    ts = Math.floor(Date.now() / 1000).toString();
  const headers = new Headers({
    "svix-id": "msg_1",
    "svix-timestamp": ts,
    "svix-signature": `v1,${createHmac("sha256", Buffer.from(secret, "base64"))
      .update(`msg_1.${ts}.${raw}`)
      .digest("base64")}`,
  });
  assert.equal(verifyMailWebhook(raw, headers, `whsec_${secret}`), true);
  assert.equal(
    verifyMailWebhook(raw + "tamper", headers, `whsec_${secret}`),
    false
  );
  assert.equal(
    verifyMailWebhook(raw, headers, `whsec_${secret}`, Date.now() + 600000),
    false
  );
});

test("privacy export is complete and owner-scoped; deletion preserves other accounts", async () => {
  const db = await database();
  try {
    await db.query(
      `insert into intelligence_personal_facts(user_id,label,value,kind,consented_at) values($1,'Private','A context','fact',now())`,
      [a]
    );
    const business = (
      await db.query<{ id: string }>(
        `insert into intelligence_business_workspaces(user_id,name,business_type,goal) values($1,'A business','services','Grow') returning id`,
        [a]
      )
    ).rows[0].id;
    await db.exec(`set request.jwt.claim.sub='${b}'`);
    await db.query(
      `insert into intelligence_personal_facts(user_id,label,value,kind,consented_at) values($1,'Private','B context','fact',now())`,
      [b]
    );
    await db.exec(`set request.jwt.claim.sub='${a}'`);
    const exported = (await db.query<any>("select intelligence_export_data()"))
      .rows[0].intelligence_export_data;
    assert.equal(exported.personal_facts.length, 1);
    assert.equal(exported.personal_facts[0].value, "A context");
    assert.equal(exported.business_workspaces[0].id, business);
    await assert.rejects(db.query("select intelligence_delete_data('yes')"));
    await db.query(
      "select intelligence_delete_data('DELETE INTELLIGENCE DATA')"
    );
    assert.equal(
      (await db.query("select * from intelligence_personal_facts")).rows.length,
      0
    );
    assert.equal(
      (await db.query("select * from intelligence_business_workspaces")).rows
        .length,
      0
    );
    await db.exec(`set request.jwt.claim.sub='${b}'`);
    assert.equal(
      (await db.query("select * from intelligence_personal_facts")).rows.length,
      1
    );
    await db.exec("reset role");
    assert.equal((await db.query("select * from auth.users")).rows.length, 2);
  } finally {
    await db.close();
  }
});

test("sending uses the immutable approved preview, records acceptance only, and quarantines ambiguous outcomes", async () => {
  const { sendOne } = await import("../app/lib/intelligence/mail.server");
  function fixture() {
    const outbox = {
      id: "outbox_test",
      user_id: a,
      campaign_id: "campaign",
      draft_id: "draft",
      revision: 1,
      recipient: "recipient@example.com",
      status: "dispatching",
      unsubscribe_token: crypto.randomUUID(),
      provider_id: null as string | null,
    };
    let claimed = false;
    const records: Record<string, any> = {
      intelligence_outreach_versions: {
        final_body:
          "Exact approved text\n\nStop these messages: https://inlits.test/unsubscribe?token=test",
        subject: "Approved subject",
        public_origin: "https://inlits.test",
      },
      intelligence_campaigns: {
        cancelled: false,
        revision: 2,
        permission_revision: 2,
        permission_expires_at: new Date(Date.now() + 60000).toISOString(),
      },
      intelligence_outreach_drafts: {
        review: "approved",
        revision: 1,
        approved_revision: 1,
      },
      intelligence_suppressions: null,
    };
    const db = {
      rpc: async () => ({
        data: claimed ? [] : ((claimed = true), [outbox]),
        error: null,
      }),
      from: (table: string) => {
        let patch: any;
        const filters: Record<string, unknown> = {};
        const builder: any = {
          select: () => builder,
          eq: (k: string, v: unknown) => {
            filters[k] = v;
            return builder;
          },
          single: async () => ({ data: records[table], error: null }),
          maybeSingle: async () => ({ data: records[table], error: null }),
          update: (v: unknown) => {
            patch = v;
            return builder;
          },
          then: (resolve: Function) => {
            if (
              table === "intelligence_outbox" &&
              (!filters.status || outbox.status === filters.status)
            )
              Object.assign(outbox, patch);
            return Promise.resolve(resolve({ data: null, error: null }));
          },
        };
        return builder;
      },
    };
    return { db: db as any, outbox, records };
  }
  const config = {
    INLITS_SEND_ENABLED: "true",
    RESEND_API_KEY: "test-only",
    RESEND_FROM: "sender@example.com",
    RESEND_WEBHOOK_SECRET: "test-only-webhook",
    INLITS_PUBLIC_ORIGIN: "https://inlits.test",
    INLITS_SEND_ALLOWED_USER_IDS: a,
  };
  const good = fixture();
  let calls = 0;
  await sendOne(good.db, config, async (_url, init) => {
    calls++;
    assert.equal(
      JSON.parse(String(init?.body)).text,
      good.records.intelligence_outreach_versions.final_body
    );
    assert.equal(
      (init?.headers as Record<string, string>)["Idempotency-Key"],
      "inlits-outbox_test"
    );
    return new Response(JSON.stringify({ id: "provider-accepted" }), {
      status: 200,
    });
  });
  assert.equal(good.outbox.status, "accepted");
  assert.equal(good.outbox.provider_id, "provider-accepted");
  await sendOne(good.db, config, async () => {
    calls++;
    throw new Error();
  });
  assert.equal(calls, 1);
  const ambiguous = fixture();
  await sendOne(ambiguous.db, config, async () => {
    throw new Error("test timeout");
  });
  assert.equal(ambiguous.outbox.status, "unknown");
  const revoked = fixture();
  revoked.records.intelligence_outreach_drafts.review = "rejected";
  await sendOne(revoked.db, config, async () => {
    throw new Error("must never call provider");
  });
  assert.equal(revoked.outbox.status, "cancelled");
  const conflict = fixture();
  await sendOne(
    conflict.db,
    config,
    async () => new Response("", { status: 409 })
  );
  assert.equal(conflict.outbox.status, "unknown");
});

test("staging public configuration cannot expose service-role credentials", async () => {
  const { getPublicSupabaseConfig, legacyPublicSupabase } = await import(
    "../app/lib/supabase-public"
  );
  assert.deepEqual(getPublicSupabaseConfig({}), legacyPublicSupabase);
  assert.throws(() =>
    getPublicSupabaseConfig({
      SUPABASE_URL: "https://staging.example.com",
      SUPABASE_ANON_KEY: "sb_secret_private",
    })
  );
  assert.throws(() =>
    getPublicSupabaseConfig({ SUPABASE_URL: "https://staging.example.com" })
  );
  assert.equal(
    getPublicSupabaseConfig({
      SUPABASE_URL: "https://staging.example.com",
      SUPABASE_ANON_KEY: "sb_publishable_public",
    }).url,
    "https://staging.example.com"
  );
});
