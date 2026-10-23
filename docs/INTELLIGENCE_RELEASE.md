# Inlits implementation and release gates — 23 October 2026

**Not deployed. Not launch-ready.** This branch contains implemented frontend, server routes, SQL migrations, provider adapters and a persistent-worker entry point. Live providers and hosted infrastructure have not been verified. Fixture-only provider tests must not be interpreted as real research, email delivery or Hermes execution.

## Architecture actually implemented

Preserves the existing `dvZee/inlits` Remix / React 18 / Supabase / Netlify application and audiobook routes. Starting production branch was `58f473c69086b550d92ef4bbf1d9ec1639cfebf9`. The September Product Bible was reviewed; the uploaded October mandate is the current product contract.

- `/intelligence`: calm Home, ME, CHOOSE and WORK surfaces with light/dark appearance control. Home reads saved artifacts, pending drafts and failures; it never invents completed operations.
- `/api/intelligence`: verified Supabase JWT, strict input commands, same-origin mutations, bounded JSON bodies, private response caching, personal context and decision memory.
- `/api/workflows`: owner-scoped jobs, current approved-message previews, exact campaign recipient counts and explicitly separate review/authorization/queue actions. Capabilities require a recent worker heartbeat. Provider configuration is not evidence of successful provider access.
- Four additive migrations create personal facts and corrections, versioned reflection definitions, decision records, businesses, goals, durable jobs, leases, schedules, company leads, immutable outreach versions, outbox records, suppressions, audit events, usage allowances and privacy RPCs.
- Existing browser and server Supabase clients can now use the same environment-selected project. Only public anonymous/publishable credentials enter the browser; service-role keys are rejected by the public-config validator. Legacy public configuration is retained when neither environment variable is supplied.
- `scripts/worker/run.ts` runs independently of the web process. It ticks schedules, claims Postgres jobs with `SKIP LOCKED`, executes bounded handlers, verifies returned artifacts and publishes them only with a current lease. No in-memory queue is presented as durable infrastructure.
- `deploy/worker.Dockerfile` packages that Node worker. The Docker image has not been built or deployed in this environment.
- Server and worker secrets stay in runtime environment variables. Worker logging records job IDs, types and error codes rather than prompts, model responses or keys.

## Working product behavior in code

### ME

Editable personal facts distinguish user facts, interpretations and uncertain hypotheses. Database-backed correction history is preserved; deleting a fact deletes that fact's correction history. Saved decision/job snapshots are separate historical records and are removed through intelligence-data deletion.

Six versioned, three-question self-reflections cover values, cognition, communication, career/enterprise, money habits and habits/energy. They save/resume, calculate repeatable results and can save insights with consent. Database triggers replace forged client scores and reject edits to completed sessions. They are explicitly **informal reflections**, not validated psychometric instruments, clinical screens or comprehensive financial assessments. No clinical instruments are exposed.

### CHOOSE

Manual comparisons, reasons, context snapshots, next steps and outcomes persist. When an AI-enabled worker is configured, a decision becomes a persisted background research job. Research receives only the entered decision topic. Selected Personal Model context is supplied separately to a synthesis call without tools. A user should still avoid putting private information into a public research topic.

The OpenAI Responses adapter uses strict structured output, `store:false`, explicit model selection, timeouts and bounded output/tool calls. Outputs are validated again on the server. Displayed source URLs must match URLs returned by the provider's research output; this verifies source provenance, not the truth of every claim. Recommended alternatives, tradeoffs, uncertainty and one next step are stored as an artifact. User acceptance copies the actual job result, original context snapshot and source evidence into decision memory.

### WORK

Business creation and decision-to-goal handoff persist; goals remain labelled plans. Implemented handlers include:

- Company research: public evidence → validated company records → domain deduplication → transactional persistence. No guessed email addresses. Company websites must have appeared among retrieved source domains. Qualification describes fit, not purchase intent.
- Daily brief: deterministic summary of saved workspace goals and job statuses. It does not invent revenue, orders or external provider activity. A schedule runs every 24 hours after enablement; pending briefs do not accumulate indefinitely.
- Hermes plan: private HTTP API adapter, disabled unless isolation is explicitly verified. It checks `/v1/toolsets` and refuses enabled or unknown tools before requesting a text plan. Session keys are ephemeral. Operator-side memory disablement and sandbox isolation remain required. This is a proposed-plan artifact, not full business automation.

### Outreach

Draft preparation stores immutable version snapshots, including the exact unsubscribe footer shown in the review preview. Recipient/body/subject edits increment the version, reset approval, revoke campaign sending permission and cancel queued versions. Per-message and transactional bulk review are available. The user separately grants a revision-bound, expiring recipient limit, then explicitly queues approved versions.

Delivery uses a configured Resend sender, a server-side account allowlist and provider idempotency keys. There is a 50-recipient campaign maximum and 50 attempted sends per account per database day. The worker rechecks current approval, campaign permission and suppression before dispatch. Cancellation/revocation stops queued work; requests already in flight cannot be recalled.

Provider acceptance is stored as `accepted`, not `delivered`. Delivery/bounce/complaint updates require signed, fresh webhook requests and deduplicated provider events. Reordered events cannot turn a known bounce into delivery. An ambiguous timeout or interrupted dispatch becomes `unknown` and is **not automatically resent**. These cases require provider reconciliation.

Resend is a disabled-by-default, operator-configured delivery adapter for an allowlisted launch account. It is not a completed multi-tenant OAuth connector marketplace or permission to send a real campaign.

### Privacy

Users can export all their intelligence records through an authenticated download and explicitly delete intelligence records/workspaces. Existing audiobook accounts and libraries are preserved. Deletion is blocked while provider dispatch is in flight. This does not implement full deletion of the legacy Inlits account, backups or provider-held copies; that broader privacy lifecycle remains a launch gate.

## Verification matrix

| Feature | Implemented | Integrated | Tested | Deployed | Evidence / remaining blocker |
| --- | --- | --- | --- | --- | --- |
| Personal Model and corrections | Yes | UI/API/SQL | Actual PostgreSQL RLS/history | No | Hosted migration and authenticated journeys |
| Reflections and resume | Yes | UI/API/versioned SQL | Validation, repeatability, tamper rejection, immutability | No | Full signed-in browser journey |
| Decision memory/handoff | Yes | UI/API/RPC | Ownership, validation, retry safety | No | Hosted data and browser verification |
| OpenAI research/synthesis | Adapter + worker | No live connection | Test-only provider fixtures, refusal/incomplete/source checks | No | Secret configuration, model and spend allowance, live acceptance test |
| Durable jobs/schedules | Yes | SQL + independent worker entry | SQL claims, quotas, leases, cancellation, schedule deduplication | No | Persistent host and real process/browser-close test |
| Lead research | Yes | Provider pipeline + artifact/lead persistence | Output validation/domain deduplication fixtures | No | Live research and hosted records |
| Daily business brief | Yes | Saved workspace data + scheduler | Queue/schedule tests; no external analytics | No | Independently running worker |
| Hermes | HTTP plan adapter only | No live runtime | Isolation gating, enabled-tool refusal boundary, incomplete results | No | Pinned runtime, separate sandbox, memory isolation, keys and live verification |
| Outreach review and permissions | Yes | UI/API/transactional RPCs | Immutable versions, reapproval, owner isolation, deduplication | No | Full authenticated review journey |
| Email delivery/webhooks | Disabled adapter | No live provider | Test-only HTTP fixtures + SQL event transitions/signatures | No | Verified sender, webhook, allowlist and authorized test recipient |
| Intelligence export/delete | Yes | UI/API/RPCs | Complete owner-scoped export/deletion tests | No | Hosted verification; broader account/provider deletion remains |
| Themes/navigation | Yes | Existing theme provider | Signed-out desktop navigation; no authenticated/mobile audit | No | Full browser/accessibility matrix |
| Ecommerce order workflow | No | No | No | No | Provider access and implementation remain |
| Subscription entitlements/payments | Legacy only | Not reverified | No live billing test | No new release | Legal/provider eligibility, entitlements and billing verification remain |
| Monitoring/backups/recovery | Basic health/logging only | No production services | No operational drill | No | Hosting configuration, backups and restore/rollback drill |

## Validation evidence

`npm run test:intelligence` runs PostgreSQL/RLS tests using PGlite plus explicitly test-only provider transports. `npm run typecheck` and `npm run build` are also required. The current local suite has 12 passing tests. Full command output is in `docs/verification/`. The first GitHub Actions run for the earlier commit reported failure; its step list was empty and its log download returned 404, so remote CI is not asserted to pass. Check the latest commit's run before merging.

Observed in the actual browser: signed-out app loads, navigation changes the active view, and WORK remains behind authentication. UTF-8 and hydration issues were corrected. No real account credentials were entered. Authenticated E2E, mobile viewports, live sending, OpenAI calls, Hermes execution and browser-independent worker execution remain unverified.

## Configure and stage

1. Use a non-production Supabase project/branch; rehearse the four new migrations in timestamp order. Existing migration history must match the existing app: do not blindly replay all legacy migrations onto a live project.
2. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` for the Remix host. The root loader distributes only the public configuration to the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` server/worker-only for delivery webhooks and worker operations.
3. Set `INLITS_PUBLIC_ORIGIN` to the exact HTTPS origin before preparing outreach. The final unsubscribe URL is frozen into the reviewed version. Changing the public origin requires new message preparation/approval.
4. Deploy the web branch to an isolated Netlify preview. `netlify.toml` uses Node 22. Do not merge or change production DNS solely to obtain a preview.
5. Deploy the independent worker with `.env.example` as the configuration-name reference. `INLITS_WORKER_ENABLED=true` starts the runner; no browser or web request keeps it alive.
6. Enable AI only with a configured project key, supported `OPENAI_MODEL` and provider-side spending controls. There are 10 user-created jobs/account/day, 20 paid job attempts/project/day, up to three attempts/job, 3 search calls/research request and 3,500 output tokens/request. These are technical limits, not a guaranteed dollar ceiling. Project billing limits are still required.
7. Keep Hermes disabled until its pinned deployment has no tools, no shared memory, no app database/mail credentials, restricted egress and resource limits. Configure API key/HTTPS endpoint and verify isolation before setting its enable flags.
8. Keep delivery disabled until a sender domain and signed webhook at `/api/mail-webhook` are verified. Configure an explicit `INLITS_SEND_ALLOWED_USER_IDS` list. Use only an explicitly authorized test recipient for first delivery verification.
9. Verify two-account isolation through real REST requests and every signed-in browser journey. Close the browser and independently observe worker execution, then reopen and verify saved provider/artifact evidence.
10. Reconcile ambiguous sends manually at the provider; never reset their state merely to force a resend.

## Operations / rollback / remaining work

`/api/health` reports web availability and whether public DB configuration exists; it does not claim a successful DB connection. Authenticated workflow capabilities use a recent worker heartbeat, which should be monitored independently. No uptime monitor, alert destination or backup service has been provisioned.

Before authorized production changes, preserve the previous hosting version and take/verify a database backup. These migrations are additive. Rollback the application first and retain new tables to avoid destroying user data. Destructive schema rollback is not automatic.

Still needed: hosted Supabase access through usable project tools, existing web hosting/project access, an independently running worker host, secure OpenAI/Resend/Hermes configuration, explicit spending limits and live provider tests. Supabase installation was confirmed in this session, but its database/project operations were not exposed in the available execution tools, so no hosted project was inspected or migrated.

Independent engineering still remains: ecommerce integration, comprehensive domain assessments, subscription/entitlement lifecycle, legacy account deletion, updated legal/privacy disclosures, monitoring/backups, wider abuse controls, complete accessibility/mobile QA, and the final production security/release audit. Credentials alone do not finish those items.

No paid infrastructure was provisioned. No real campaign, live payment, production migration, production deployment, DNS change or real provider inference was performed. Recurring costs cannot be represented as verified until the selected hosts, models, provider plans and measured workload are known.

## Primary references checked

- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://hermes-agent.nousresearch.com/docs/developer-guide/programmatic-integration
- https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/webhooks/verify-webhooks-requests
- https://resend.com/changelog/idempotency-keys
