import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  assessmentDefinitions,
  scoreAssessment,
} from "../app/lib/intelligence/assessments";
import { commandSchema } from "../app/lib/intelligence/contracts";
test("six transparent reflective instruments reject invalid responses and score repeatably", () => {
  assert.equal(assessmentDefinitions.length, 6);
  for (const a of assessmentDefinitions) {
    assert.deepEqual(
      scoreAssessment(a.id, [5, 5, 5]),
      scoreAssessment(a.id, [5, 5, 5])
    );
    assert.equal(scoreAssessment(a.id, [1, 2, 3]).total, 6);
    for (const values of [[], [0, 1, 2], [1, 2, 6], [1, 2, 2.5], [1, 2, NaN]])
      assert.throws(() => scoreAssessment(a.id, values));
  }
  assert.throws(() => scoreAssessment("unknown", [1, 2, 3]));
});
test("commands enforce explicit consent, input boundaries and reject ownership injection", () => {
  assert.equal(
    commandSchema.safeParse({
      action: "fact.save",
      label: "Goal",
      value: "Launch",
      kind: "fact",
      consent: true,
    }).success,
    true
  );
  for (const extra of [
    { consent: false },
    { user_id: "someone-else" },
    { kind: "verified" },
    { value: "x".repeat(2001) },
  ])
    assert.equal(
      commandSchema.safeParse({
        action: "fact.save",
        label: "Goal",
        value: "Launch",
        kind: "fact",
        consent: true,
        ...extra,
      }).success,
      false
    );
  assert.equal(
    commandSchema.safeParse({
      action: "goal.create",
      decision_id: crypto.randomUUID(),
      business_id: crypto.randomUUID(),
      share_context: false,
    }).success,
    false
  );
  assert.equal(
    commandSchema.safeParse({
      action: "assessment.save",
      assessment: "money",
      answers: [1, 2, 9],
      complete: true,
    }).success,
    false
  );
});
test("migration applies; real Postgres RLS separates users; goal handoff is idempotent", async () => {
  const db = new PGlite();
  await db.exec(
    `create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`
  );
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/20261023180000_intelligence_foundation.sql",
        import.meta.url
      ),
      "utf8"
    )
  );
  const a = "11111111-1111-4111-8111-111111111111",
    b = "22222222-2222-4222-8222-222222222222";
  await db.query("insert into auth.users(id) values($1),($2)", [a, b]);
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${a}';`);
  const fact = await db.query<{ id: string }>(
    `insert into intelligence_personal_facts(user_id,label,value,kind,consented_at) values($1,'Goal','Launch','fact',now()) returning id`,
    [a]
  );
  await db.query(
    `update intelligence_personal_facts set value='Launch safely' where id=$1`,
    [fact.rows[0].id]
  );
  assert.equal(
    (await db.query("select * from intelligence_fact_history")).rows.length,
    1
  );
  for (const definition of assessmentDefinitions) {
    const stored = await db.query<{ definition: unknown }>(
      "select definition from intelligence_assessment_definitions where assessment_id=$1",
      [definition.id]
    );
    assert.deepEqual(stored.rows[0].definition, definition);
  }
  const session = await db.query<{
    id: string;
    result: ReturnType<typeof scoreAssessment>;
  }>(
    `insert into intelligence_assessment_sessions(user_id,assessment_id,version,answers,result,status) values($1,'money',1,'[1,2,3]','{"total":999}','completed') returning id,result`,
    [a]
  );
  assert.deepEqual(
    session.rows[0].result,
    scoreAssessment("money", [1, 2, 3]),
    "Database must replace forged scores with deterministic results"
  );
  await assert.rejects(
    db.query(
      `update intelligence_assessment_sessions set answers='[5,5,5]' where id=$1`,
      [session.rows[0].id]
    )
  );
  await assert.rejects(
    db.query(
      `insert into intelligence_assessment_sessions(user_id,assessment_id,version,answers,status) values($1,'money',1,'[1,2,9]','in_progress')`,
      [a]
    )
  );
  const resumed = await db.query<{ id: string }>(
    `insert into intelligence_assessment_sessions(user_id,assessment_id,version,answers,status) values($1,'values',1,'[1,null,null]','in_progress') returning id`,
    [a]
  );
  await db.query(
    `update intelligence_assessment_sessions set answers='[1,2,3]',status='completed' where id=$1`,
    [resumed.rows[0].id]
  );
  const decision = await db.query<{ id: string }>(
    `insert into intelligence_decision_records(user_id,topic,options,selected,reason,next_step) values($1,'Launch route','[{"name":"A"},{"name":"B"}]',0,'Reversible','Test staging') returning id`,
    [a]
  );
  const business = await db.query<{ id: string }>(
    `insert into intelligence_business_workspaces(user_id,name,business_type,goal) values($1,'Inlits','services','Launch') returning id`,
    [a]
  );
  for (let i = 0; i < 2; i++)
    await db.query("select intelligence_create_goal($1,$2)", [
      decision.rows[0].id,
      business.rows[0].id,
    ]);
  assert.equal(
    (await db.query("select * from intelligence_work_goals")).rows.length,
    1
  );
  await db.exec(`set request.jwt.claim.sub='${b}'`);
  for (const table of [
    "personal_facts",
    "fact_history",
    "assessment_sessions",
    "decision_records",
    "business_workspaces",
    "work_goals",
  ])
    assert.equal(
      (await db.query(`select * from intelligence_${table}`)).rows.length,
      0,
      `${table} leaked user A data`
    );
  assert.equal(
    (
      await db.query(
        "update intelligence_personal_facts set value='stolen' returning id"
      )
    ).rows.length,
    0
  );
  await assert.rejects(
    db.query(
      `insert into intelligence_personal_facts(user_id,label,value,kind,consented_at) values($1,'Impersonate','x','fact',now())`,
      [a]
    )
  );
  await assert.rejects(
    db.query("select intelligence_create_goal($1,$2)", [
      decision.rows[0].id,
      business.rows[0].id,
    ])
  );
  await db.exec("set role anon");
  await assert.rejects(db.query("select * from intelligence_personal_facts"));
  await db.close();
});

test("API fails closed for unauthenticated, cross-origin and unsupported requests", async () => {
  const { loader, action } = await import("../app/routes/api.intelligence");
  await assert.rejects(
    loader({
      request: new Request("https://inlits.test/api/intelligence"),
      params: {},
      context: {},
    }),
    (response: unknown) =>
      response instanceof Response &&
      response.status === 401 &&
      response.headers.get("Cache-Control")?.includes("no-store") === true
  );
  const args = (request: Request) => ({ request, params: {}, context: {} });
  assert.equal(
    (
      await action(
        args(
          new Request("https://inlits.test/api/intelligence", {
            method: "POST",
            headers: {
              Origin: "https://attacker.test",
              "Content-Type": "application/json",
            },
            body: "{}",
          })
        )
      )
    ).status,
    403
  );
  assert.equal(
    (
      await action(
        args(
          new Request("https://inlits.test/api/intelligence", {
            method: "DELETE",
          })
        )
      )
    ).status,
    405
  );
  assert.equal(
    (
      await action(
        args(
          new Request("https://inlits.test/api/intelligence", {
            method: "POST",
            headers: { Origin: "https://inlits.test" },
            body: "x",
          })
        )
      )
    ).status,
    415
  );
});
