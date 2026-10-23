import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  researchTopic,
  synthesizeDecision,
  qualifyLeads,
  ProviderError,
} from "../../app/lib/intelligence/ai.server";
import {
  sendOne,
  sendingConfigured,
} from "../../app/lib/intelligence/mail.server";
import { hermesPlan } from "../../app/lib/intelligence/hermes.server";
export type Job = {
  id: string;
  user_id: string;
  business_id: string | null;
  kind: string;
  input: { topic: string; context: unknown[]; ai_consent: boolean };
  lease_token: string;
  attempts: number;
};
export async function executeJob(
  job: Job,
  db: SupabaseClient,
  config: NodeJS.ProcessEnv = process.env
) {
  if (job.kind === "daily_brief") {
    const [goals, jobs] = await Promise.all([
      db
        .from("intelligence_work_goals")
        .select("id,title,next_step,status")
        .eq("user_id", job.user_id)
        .eq("business_id", job.business_id),
      db
        .from("intelligence_jobs")
        .select("id,kind,status,error_code,updated_at")
        .eq("user_id", job.user_id)
        .eq("business_id", job.business_id)
        .neq("id", job.id)
        .order("updated_at", { ascending: false })
        .limit(50),
    ]);
    if (goals.error || jobs.error)
      throw new ProviderError("brief_data_unavailable", true);
    return {
      kind: "daily_brief",
      as_of: new Date().toISOString(),
      goals: goals.data || [],
      recent_jobs: jobs.data || [],
      summary:
        "Based on saved business goals and job records. Planned goals are not completed work; completed research jobs indicate saved artifacts, not external actions.",
      coverage:
        "Inlits workspace records only. No external revenue, orders, inventory or provider activity is inferred.",
    };
  }
  if (!job.input.ai_consent)
    throw new ProviderError("missing_ai_consent", false);
  if (job.kind === "hermes_plan") return hermesPlan(job.input.topic, config);
  if (
    config.INLITS_AI_ENABLED !== "true" ||
    !config.OPENAI_API_KEY ||
    !config.OPENAI_MODEL
  )
    throw new ProviderError("ai_not_configured", false);
  const ai = { key: config.OPENAI_API_KEY, model: config.OPENAI_MODEL };
  const research = await researchTopic(job.input.topic, ai);
  if (job.kind === "decision_research")
    return {
      kind: job.kind,
      ...(await synthesizeDecision(
        job.input.topic,
        job.input.context,
        research,
        ai
      )),
    };
  if (job.kind === "lead_research")
    return {
      kind: job.kind,
      ...(await qualifyLeads(job.input.topic, research, ai)),
    };
  throw new ProviderError("unsupported_job", false);
}
export async function workerTick(
  db: SupabaseClient,
  config: NodeJS.ProcessEnv = process.env
) {
  const capabilities = {
    ai:
      config.INLITS_AI_ENABLED === "true" &&
      !!config.OPENAI_API_KEY &&
      !!config.OPENAI_MODEL,
    hermes:
      config.INLITS_HERMES_ENABLED === "true" &&
      config.HERMES_ISOLATION_VERIFIED === "true" &&
      !!config.HERMES_API_URL &&
      !!config.HERMES_API_KEY,
    briefs: true,
    sending: sendingConfigured(config),
  };
  const heartbeat = await db.from("intelligence_runtime_health").upsert({
    id: "worker",
    last_seen_at: new Date().toISOString(),
    capabilities,
  });
  if (heartbeat.error) throw new Error("worker_heartbeat_failed");
  const schedule = await db.rpc("intelligence_tick_schedules");
  if (schedule.error) throw new Error("schedule_tick_failed");
  const claim = await db.rpc("intelligence_claim_job");
  if (claim.error) throw new Error("job_claim_failed");
  const job = claim.data?.[0] as Job | undefined;
  if (!job) return sendOne(db, config);
  try {
    const artifact = await executeJob(job, db, config);
    const finish = await db.rpc("intelligence_finish_job", {
      job: job.id,
      lease: job.lease_token,
      output: artifact,
      failure: null,
      retry: false,
    });
    if (finish.error)
      throw new ProviderError("artifact_persistence_failed", true);
    // A cancelled or re-leased job returns false; never claim its artifact was published.
    console.log(
      JSON.stringify({
        event: finish.data ? "job_artifact_saved" : "job_lease_lost",
        job_id: job.id,
        kind: job.kind,
      })
    );
  } catch (error) {
    const code =
      error instanceof ProviderError ? error.code : "worker_execution_failed";
    const retry = error instanceof ProviderError && error.retryable;
    const finish = await db.rpc("intelligence_finish_job", {
      job: job.id,
      lease: job.lease_token,
      output: null,
      failure: code,
      retry,
    });
    if (finish.error) throw new Error("failure_persistence_failed");
    console.log(
      JSON.stringify({ event: "job_failed", job_id: job.id, code, retry })
    );
  }
  return true;
}
async function main() {
  if (process.env.INLITS_WORKER_ENABLED !== "true")
    throw new Error("Worker disabled: set INLITS_WORKER_ENABLED explicitly.");
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Worker database credentials are not configured.");
  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  let stopping = false;
  process.on("SIGTERM", () => {
    stopping = true;
  });
  process.on("SIGINT", () => {
    stopping = true;
  });
  do {
    try {
      const worked = await workerTick(db);
      if (process.argv.includes("--once")) break;
      if (!worked) await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch {
      console.error(JSON.stringify({ event: "worker_tick_failed" }));
      if (process.argv.includes("--once")) {
        process.exitCode = 1;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  } while (!stopping);
}
if (
  import.meta.url === new URL(process.argv[1], `file://${process.cwd()}/`).href
)
  main().catch(() => {
    console.error("Worker configuration failed. No secret values were logged.");
    process.exitCode = 1;
  });
