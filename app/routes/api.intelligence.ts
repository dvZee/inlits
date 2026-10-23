import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  authenticate,
  databaseError,
  privateHeaders,
} from "@/lib/intelligence/server.server";
import { commandSchema } from "@/lib/intelligence/contracts";
import { scoreAssessment } from "@/lib/intelligence/assessments";
export async function loader({ request }: LoaderFunctionArgs) {
  const { db, user } = await authenticate(request);
  const tables = [
    "personal_facts",
    "assessment_sessions",
    "decision_records",
    "business_workspaces",
    "work_goals",
  ] as const;
  const results = await Promise.all(
    tables.map((table) =>
      db
        .from(`intelligence_${table}`)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)
    )
  );
  for (const result of results) if (result.error) databaseError(result.error);
  return json(
    Object.fromEntries(
      tables.map((table, index) => [table, results[index].data])
    ),
    { headers: privateHeaders }
  );
}
export async function action({ request }: ActionFunctionArgs) {
  try {
    if (request.method !== "POST")
      return json({ error: "Method not allowed." }, 405);
    if (request.headers.get("Origin") !== new URL(request.url).origin)
      return json({ error: "Unrecognized request origin." }, 403);
    if (!request.headers.get("Content-Type")?.startsWith("application/json"))
      return json({ error: "Use JSON." }, 415);
    const { db, user } = await authenticate(request);
    const body = await request.text();
    if (body.length > 24000)
      return json({ error: "Request is too large." }, 413);
    let input: unknown;
    try {
      input = JSON.parse(body);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }
    const parsed = commandSchema.safeParse(input);
    if (!parsed.success)
      return json({ error: "Please check the required fields." }, 400);
    const c = parsed.data;
    let result;
    switch (c.action) {
      case "fact.save": {
        const record = {
          label: c.label,
          value: c.value,
          kind: c.kind,
          source: "user",
          consented_at: new Date().toISOString(),
        };
        result = c.id
          ? await db
              .from("intelligence_personal_facts")
              .update(record)
              .eq("id", c.id)
              .eq("user_id", user.id)
              .select()
              .single()
          : await db
              .from("intelligence_personal_facts")
              .insert({ ...record, user_id: user.id })
              .select()
              .single();
        break;
      }
      case "fact.delete":
        result = await db
          .from("intelligence_personal_facts")
          .delete()
          .eq("id", c.id)
          .eq("user_id", user.id)
          .select("id")
          .single();
        break;
      case "assessment.save": {
        const answers = c.answers;
        if (c.complete && answers.some((a) => a === null))
          return json(
            { error: "Answer all questions before completing." },
            400
          );
        const record = {
          assessment_id: c.assessment,
          version: 1,
          answers,
          result: c.complete
            ? scoreAssessment(c.assessment, answers as number[])
            : null,
          status: c.complete ? "completed" : "in_progress",
        };
        if (c.id) {
          const { data: old, error } = await db
            .from("intelligence_assessment_sessions")
            .select("assessment_id,status")
            .eq("id", c.id)
            .eq("user_id", user.id)
            .single();
          if (
            error ||
            old?.assessment_id !== c.assessment ||
            old?.status === "completed"
          )
            return json(
              {
                error:
                  "This assessment cannot be changed. Start a new reflection.",
              },
              409
            );
          result = await db
            .from("intelligence_assessment_sessions")
            .update(record)
            .eq("id", c.id)
            .eq("user_id", user.id)
            .eq("status", "in_progress")
            .select()
            .single();
        } else
          result = await db
            .from("intelligence_assessment_sessions")
            .insert({ ...record, user_id: user.id })
            .select()
            .single();
        break;
      }
      case "decision.save": {
        if (c.selected >= c.options.length)
          return json({ error: "Choose an available option." }, 400);
        let snapshot: unknown[] = [];
        if (c.use_personal_context) {
          const { data, error } = await db
            .from("intelligence_personal_facts")
            .select("id,label,value,kind,updated_at")
            .eq("user_id", user.id);
          if (error) databaseError(error);
          snapshot = data || [];
        }
        result = await db
          .from("intelligence_decision_records")
          .insert({
            user_id: user.id,
            topic: c.topic,
            options: c.options,
            selected: c.selected,
            reason: c.reason,
            next_step: c.next_step,
            context_snapshot: snapshot,
            context_consent: c.use_personal_context,
          })
          .select()
          .single();
        break;
      }
      case "decision.outcome":
        result = await db
          .from("intelligence_decision_records")
          .update({ outcome: c.outcome })
          .eq("id", c.id)
          .eq("user_id", user.id)
          .select()
          .single();
        break;
      case "business.create":
        result = await db
          .from("intelligence_business_workspaces")
          .insert({
            user_id: user.id,
            name: c.name,
            business_type: c.type,
            goal: c.goal,
          })
          .select()
          .single();
        break;
      case "goal.create":
        result = await db.rpc("intelligence_create_goal", {
          decision: c.decision_id,
          business: c.business_id,
        });
        break;
      case "goal.cancel":
        result = await db
          .from("intelligence_work_goals")
          .update({ status: "cancelled" })
          .eq("id", c.id)
          .eq("user_id", user.id)
          .eq("status", "planned")
          .select()
          .single();
        break;
    }
    if (result?.error) databaseError(result.error);
    return json({ record: result?.data }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof Response) {
      for (const [key, value] of Object.entries(privateHeaders))
        error.headers.set(key, value);
      return error;
    }
    return json(
      { error: "The request could not be completed." },
      { status: 500, headers: privateHeaders }
    );
  }
}
