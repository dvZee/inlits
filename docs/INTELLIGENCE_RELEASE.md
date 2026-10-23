# Inlits intelligence implementation — 23 October 2026

## Release status

**Not launch-ready. Not deployed.** This branch adds a real database-backed foundation to the existing Remix application. It is not the full ME/CHOOSE/WORK mandate. The original audiobook application, existing authentication provider, and legacy data remain in place. The new route is `/intelligence`; it is intentionally not advertised in the production navigation yet.

## Audit and architecture

Audited repository: `dvZee/inlits`, starting at `58f473c69086b550d92ef4bbf1d9ec1639cfebf9`. It is a Remix + React 18 application, not a blank Next.js project. It already uses Supabase authentication/Postgres and a Netlify adapter, with legacy books, audio, accounts and payment flows. `inlits/inlits` also exists but is not the writable repository selected for this change. No current production database inspection was performed.

Reviewed Product Bible v2.0 via the connected Drive. The uploaded master build mandate supersedes its older navigation and roadmap; keep subscription alignment, explainability, personal context and user agency.

Implemented architecture:

- Existing Remix route `/intelligence` provides Home, ME, CHOOSE and WORK views.
- `/api/intelligence` authenticates every request against Supabase `getUser`, forwarding the user's JWT to database queries. It never uses a service role.
- Strict Zod command validation rejects arbitrary properties, invalid IDs and missing consent. POSTs require same origin and JSON. Private API responses disable caching.
- Additive migration creates owner-isolated personal facts, correction history, versioned assessment definitions/sessions, decision records, businesses and work goals.
- Database triggers enforce assessment scoring and immutability even if clients bypass Remix. Facts retain correction history; deleting a fact deletes that fact's history. Decision snapshots remain historical records.
- Decision-to-business handoff runs in one Postgres function and has a unique constraint for retry safety. It transfers title/next step only; personal context snapshots are not copied to the business.
- Work goals have only `planned` and `cancelled` states. There is no worker or external-action capability in this branch, and no completed-work claim.

## Product contract and verification matrix

| Feature | Implemented | Integrated | Tested | Deployed | Evidence / blocker |
| --- | --- | --- | --- | --- | --- |
| Existing-account authentication gate | Yes | Existing client + verified server JWT | Browser signed-out gate; API rejects unauthenticated requests | No | Live authenticated journey needs staging test account |
| Personal facts, corrections, deletion | Yes | API + migration + UI | DB correction history and RLS | No | Migration not applied to hosted Supabase |
| Six reflective assessments | Yes | Versioned question bank + sessions + deterministic scoring | Repeatability, invalid answers, scoring tamper rejection, completion immutability, resume | No | These are brief informal reflections, not validated instruments or comprehensive psychometrics |
| Decision memory and outcomes | Yes | UI + API + DB | Input validation; owner isolation | No | Manual decision journal, not AI recommendations |
| Decision → business goal | Yes | UI + transactional RPC | Ownership and retry idempotency | No | Plans only; no execution worker |
| Home / ME / CHOOSE / WORK navigation | Yes | Existing Remix shell | Browser checked signed-out navigation | No | Signed-in desktop/mobile journeys still required |
| AI decision/research engine | No | No | No | No | Implementation + secure OpenAI configuration + usage budget required |
| Hermes execution | No | No | No | No | Runtime integration, sandbox, worker host, pinned version and security review required |
| Durable queue, scheduler, daily brief | No | No | No | No | Worker implementation and independently verified hosting required |
| Lead research and outreach | No | No | No | No | Lead/source pipeline, draft versions, approvals, provider, suppression and delivery verification required |
| Ecommerce operations | No | No | No | No | Provider choice, OAuth/data contracts and workflow implementation required |
| Billing | Legacy only | Not reverified | No live billing test | No new changes | Legal entity/provider eligibility and live payment verification required |
| Data export and full account deletion | No new flow | No | No | No | Full privacy lifecycle remains a release gate |
| Monitoring, backups, incident recovery | Not configured | No | No | No | Hosting/database access and operational verification required |

## Validation

Commands:

```bash
npm ci --ignore-scripts
npm run test:intelligence
npm run typecheck
npm run build
```

`test:intelligence` runs Node tests with a real WASM PostgreSQL engine (PGlite), creating Supabase-style `auth.uid()` and roles. This tests actual SQL/RLS rather than matching SQL strings. It does not connect to production Supabase and does not replace a hosted migration rehearsal.

Browser QA used the actual Remix development route, with no mocked production records. Signed-out gate and ME/CHOOSE navigation were observed. Initial UTF-8 and React hydration failures were fixed with explicit document metadata and React deduplication. Signed-in E2E, mobile viewport, dark mode and accessibility audit are not verified.

The original typecheck exposed legacy errors. Fixes include missing optional profile/creator fields, nullable rating defaults, Supabase relation normalization, optimistic-update variable scope, valid CSS values, reader default styles and filtering ebook items out of audio playback. A passing build alone does not establish playback, billing or authorization correctness for the legacy application.

## Configure and stage

1. Rehearse the additive migration against a non-production Supabase project with test users. Run multi-account RLS tests there, including direct REST calls.
2. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` on the Remix server. These must identify the same project used by the existing browser client. Do not use a service-role key for these routes. The legacy browser currently has a hardcoded public anon configuration; staging must align it before testing.
3. Use the existing Netlify/Remix deployment pipeline to deploy the branch to an isolated preview. Do not change production DNS or merge to main merely to obtain a preview.
4. Test signup, existing-account login, signout, resumed sessions, fact corrections, assessment interruption/resume, decision snapshots/outcomes and workspace handoff with two test users.
5. Check missing config, revoked/expired JWT, migration missing, cross-origin mutation and network failure behavior. Add edge/provider rate limits before public exposure.
6. Verify HTTPS, persistence after closing/reopening, sensitive-response caching and no service-worker caching of private API records.

No paid infrastructure was provisioned. No live API calls, campaigns, billing changes, DNS changes, production deployment or production database writes were performed.

## Remaining access and owner decisions

- Access to a staging Supabase project and existing hosting deployment configuration, plus a safe test account. Enter secrets only through the host's secret manager or a supported secure credential flow.
- OpenAI project configuration, model selection and explicit spend allowance.
- Persistent worker hosting and isolated Hermes runtime boundary; serverless web hosting alone is not evidence of independent background execution.
- Email/ecommerce provider choice and OAuth permissions. No real campaign sending is authorized by this implementation.
- Payment-provider eligibility for the business's actual legal entity and geography.

These access items do **not** imply the remaining engineering is already complete. The unimplemented rows above need code, integration and tests as well as credentials.

## Operations and rollback

Preserve the current production commit and take a database backup before any authorized production migration. Deploy staging first. For this additive slice, rollback the application to the previous hosting version and leave new tables in place to preserve user data. Do not drop tables as an automatic rollback. No automated backup/restore or incident drill has been verified yet.

## Cost status

Additional infrastructure provisioned: none. Existing hosting/database plan and capacity were not read. OpenAI, worker, Hermes sandbox, mail and monitoring recurring costs are not established; obtain current provider pricing and calculate against measured workload before authorizing spend. Do not interpret the absence of new spend as a zero-cost production architecture.

## Implementation log

- Audited existing repository and Product Bible; retained Remix/Supabase and audiobook routes.
- Added connected personal-context, reflection, decision-memory and goal-planning foundation.
- Added SQL/RLS tests and fail-closed API tests.
- Fixed observed UTF-8/hydration failures and existing TypeScript errors.
- Prepared code and handover for review; full launch mandate remains incomplete.
