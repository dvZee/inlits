import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
type Row = Record<string, any>;
type WorkflowState = {
  jobs: Row[];
  leads: Row[];
  campaigns: Row[];
  outreach_drafts: Row[];
  outreach_versions: Row[];
  outbox: Row[];
  schedules: Row[];
  capabilities: {
    worker: boolean;
    ai: boolean;
    hermes: boolean;
    briefs: boolean;
    sending: boolean;
  };
};
const initial: WorkflowState = {
  jobs: [],
  leads: [],
  campaigns: [],
  outreach_drafts: [],
  outreach_versions: [],
  outbox: [],
  schedules: [],
  capabilities: {
    worker: false,
    ai: false,
    hermes: false,
    briefs: false,
    sending: false,
  },
};
export function Workflows({
  mode,
  businesses,
  onDecision,
  onOpenWork,
}: {
  mode: "home" | "choose" | "work";
  onOpenWork?: () => void;
  businesses: Row[];
  onDecision: (result: Row) => void;
}) {
  const [data, setData] = useState(initial),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState<Row | null>(null),
    [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);
  const requestKey = useRef(crypto.randomUUID());
  const call = useCallback(async (command?: Row) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Please sign in.");
    const response = await fetch("/api/workflows", {
      method: command ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(command ? { "Content-Type": "application/json" } : {}),
      },
      ...(command ? { body: JSON.stringify(command) } : {}),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Workflow unavailable.");
    return body;
  }, []);
  const refresh = useCallback(async () => {
    try {
      const body = await call();
      if (alive.current) {
        setData(body);
        setError("");
      }
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [call]);
  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => {
      alive.current = false;
    };
  }, [refresh]);
  async function save(command: Row, done?: () => void) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await call(command);
      if (!alive.current) return;
      done?.();
      await refresh();
      setNotice(
        command.action === "campaign.queue"
          ? "Approved messages queued. Provider acceptance and delivery appear separately."
          : "Saved."
      );
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  const field = (f: HTMLFormElement, n: string) =>
    String(new FormData(f).get(n) || "");
  const jobs = data.jobs.filter((j) =>
    mode === "choose"
      ? j.kind === "decision_research"
      : j.kind !== "decision_research"
  );
  if (mode === "home") {
    if (
      loading ||
      (!error && !data.jobs.length && !data.outreach_drafts.length)
    )
      return null;
    const completed = data.jobs
      .filter((j) => j.status === "completed")
      .slice(0, 3);
    const pending = data.outreach_drafts.filter(
      (d) => d.review === "pending"
    ).length;
    const failed = data.jobs.find((j) => j.status === "failed");
    return (
      <section className="ii-section">
        <h2>Work worth your attention</h2>
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            {completed.map((j) => (
              <article className="ii-row" key={j.id}>
                <div>
                  <h3>
                    {j.kind === "daily_brief"
                      ? "Workspace brief saved"
                      : j.kind === "lead_research"
                      ? "Company research saved"
                      : j.kind === "decision_research"
                      ? "Decision research saved"
                      : "Plan saved"}
                  </h3>
                  <p>{j.input?.topic}</p>
                  <small>{new Date(j.updated_at).toLocaleString()}</small>
                </div>
              </article>
            ))}
            {pending > 0 && (
              <p>{pending} recent outreach drafts await review.</p>
            )}
            {failed && (
              <p>
                Needs attention: {failed.input?.topic} — {failed.error_code}
              </p>
            )}
            {!data.capabilities.worker &&
              data.jobs.some((j) =>
                ["queued", "running", "retryable"].includes(j.status)
              ) && (
                <p>
                  The worker is not checking in. Saved jobs may be awaiting
                  recovery.
                </p>
              )}
          </>
        )}
        <button onClick={onOpenWork}>Review work →</button>
      </section>
    );
  }
  return (
    <section className="ii-section">
      <div className="ii-row">
        <div>
          <h2>
            {mode === "choose" ? "Research a decision" : "Your business team"}
          </h2>
          <p>
            {loading
              ? "Checking the worker connection…"
              : error
              ? "Workflow status is unavailable."
              : data.capabilities.worker
              ? "A configured worker checked in recently."
              : "No active configured worker is connected. Saved records remain available."}
          </p>
        </div>
        <button disabled={busy} onClick={() => void refresh()}>
          Refresh status
        </button>
      </div>
      {error && (
        <p role="alert" className="ii-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="ii-notice">
          {notice}
        </p>
      )}
      {mode === "choose" && data.capabilities.ai && (
        <form
          className="ii-card ii-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            void save(
              {
                action: "job.create",
                kind: "decision_research",
                topic: field(f, "topic"),
                business_id: null,
                share_personal: new FormData(f).get("context") === "on",
                consent_ai: true,
                request_key: requestKey.current,
              },
              () => {
                requestKey.current = crypto.randomUUID();
                f.reset();
              }
            );
          }}
        >
          <h3>What would you like help choosing?</h3>
          <label>
            Your decision
            <textarea
              name="topic"
              required
              maxLength={2000}
              placeholder="Include your goal, budget and the constraints that matter."
            />
          </label>
          <label className="ii-check">
            <input name="context" type="checkbox" /> Use a snapshot of my
            Personal Model for the recommendation
          </label>
          <label className="ii-check">
            <input type="checkbox" required /> Allow OpenAI to process this
            request and selected context. Public web research uses the decision
            topic; personal context is used separately for synthesis.
          </label>
          <p>
            Research runs in the background. Review the recommendation and
            evidence before deciding.
          </p>
          <button className="ii-primary" disabled={busy}>
            Research my options
          </button>
        </form>
      )}
      {mode === "work" &&
        businesses.length > 0 &&
        (data.capabilities.ai ||
          data.capabilities.hermes ||
          data.capabilities.briefs) && (
          <form
            className="ii-card ii-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              void save(
                {
                  action: "job.create",
                  kind: field(f, "kind"),
                  topic: field(f, "topic"),
                  business_id: field(f, "business"),
                  share_personal: false,
                  consent_ai: new FormData(f).get("ai") === "on",
                  request_key: requestKey.current,
                },
                () => {
                  requestKey.current = crypto.randomUUID();
                  f.reset();
                }
              );
            }}
          >
            <h3>Delegate a bounded task</h3>
            <label>
              Business
              <select name="business" required>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Work to prepare
              <select name="kind">
                {data.capabilities.ai && (
                  <option value="lead_research">
                    Research relevant companies
                  </option>
                )}
                {data.capabilities.briefs && (
                  <option value="daily_brief">Compile a workspace brief</option>
                )}
                {data.capabilities.hermes && (
                  <option value="hermes_plan">
                    Prepare a business plan with Hermes
                  </option>
                )}
              </select>
            </label>
            <label>
              Goal & boundaries
              <textarea name="topic" maxLength={2000} required />
            </label>
            <label className="ii-check">
              <input type="checkbox" name="ai" /> Allow AI processing for
              research/planning. No private ME context is shared with business
              jobs.
            </label>
            <button className="ii-primary" disabled={busy}>
              Prepare this work
            </button>
          </form>
        )}
      {mode === "work" &&
        data.capabilities.briefs &&
        businesses.map((b) => {
          const enabled = data.schedules.some(
            (s) => s.business_id === b.id && s.enabled
          );
          return (
            <article className="ii-row" key={b.id}>
              <div>
                <h3>{b.name}: daily brief</h3>
                <p>
                  {enabled
                    ? "Scheduled every 24 hours. Only saved workspace records are included."
                    : "Receive a persisted summary of saved goals and job outcomes."}
                </p>
              </div>
              <button
                disabled={busy}
                onClick={() =>
                  void save({
                    action: "brief.schedule",
                    business_id: b.id,
                    enabled: !enabled,
                  })
                }
              >
                {enabled ? "Pause briefs" : "Enable daily briefs"}
              </button>
            </article>
          );
        })}
      {jobs.map((job) => (
        <article className="ii-card ii-result" key={job.id}>
          <small>
            {job.kind.replaceAll("_", " ")} · {job.status} · Attempt{" "}
            {job.attempts}/{job.max_attempts}
          </small>
          <h3>{job.input?.topic}</h3>
          {["queued", "running", "retryable"].includes(job.status) && (
            <button
              disabled={busy}
              onClick={() => void save({ action: "job.cancel", id: job.id })}
            >
              Cancel pending work
            </button>
          )}
          {job.error_code && <p>Needs attention: {job.error_code}</p>}
          {job.status === "completed" && job.result && (
            <>
              {job.kind === "decision_research" && (
                <>
                  <p>{job.result.recommendation}</p>
                  <ul>
                    {job.result.why?.map((why: string, i: number) => (
                      <li key={i}>{why}</li>
                    ))}
                  </ul>
                  <div className="ii-grid">
                    {job.result.options?.map((option: Row, i: number) => (
                      <div className="ii-card" key={i}>
                        <h3>
                          {option.name}
                          {i === job.result.recommended_index
                            ? " · Recommended"
                            : ""}
                        </h3>
                        <p>{option.fit}</p>
                        <p>Trade-off: {option.tradeoff}</p>
                        <button
                          disabled={busy}
                          onClick={() =>
                            onDecision({ job_id: job.id, selected: i })
                          }
                        >
                          Choose this direction
                        </button>
                      </div>
                    ))}
                  </div>
                  <p>Next: {job.result.next_step}</p>
                  <details>
                    <summary>Uncertainty & evidence</summary>
                    <ul>
                      {job.result.uncertainties?.map((u: string, i: number) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                    {job.result.sources?.map((s: Row) => (
                      <p key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.title}
                        </a>
                      </p>
                    ))}
                    <p>{job.result.limitations}</p>
                  </details>
                </>
              )}
              {job.kind === "lead_research" && (
                <>
                  <p>
                    {job.result.leads?.length || 0} company records prepared.
                    Qualification describes fit; it does not verify purchase
                    intent.
                  </p>
                  <ul>
                    {job.result.limitations?.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </>
              )}
              {job.kind === "daily_brief" && (
                <>
                  <p>{job.result.summary}</p>
                  <p>{job.result.coverage}</p>
                  {job.result.goals?.map((g: Row) => (
                    <p key={g.id}>
                      {g.title} · {g.status} — {g.next_step}
                    </p>
                  ))}
                  {job.result.recent_jobs?.map((j: Row) => (
                    <p key={j.id}>
                      {j.kind} · {j.status}
                      {j.error_code ? ` · ${j.error_code}` : ""}
                    </p>
                  ))}
                </>
              )}
              {job.kind === "hermes_plan" && (
                <>
                  <p style={{ whiteSpace: "pre-wrap" }}>{job.result.plan}</p>
                  <p>{job.result.scope}</p>
                </>
              )}
            </>
          )}
        </article>
      ))}
      {mode === "work" && (
        <>
          {data.leads.length > 0 && (
            <section className="ii-section">
              <h2>Researched companies</h2>
              {data.leads.map((lead) => (
                <article key={lead.id} className="ii-row">
                  <div>
                    <h3>{lead.company}</h3>
                    <p>{lead.qualification}</p>
                    <a
                      href={lead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source evidence ↗
                    </a>
                  </div>
                </article>
              ))}
            </section>
          )}
          {businesses.length > 0 && (
            <form
              className="ii-card ii-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                void save(
                  {
                    action: "campaign.create",
                    business_id: field(f, "business"),
                    name: field(f, "name"),
                  },
                  () => f.reset()
                );
              }}
            >
              <h2>Prepare outreach</h2>
              <label>
                Business
                <select name="business">
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Campaign name
                <input name="name" maxLength={100} required />
              </label>
              <button disabled={busy}>Create campaign</button>
            </form>
          )}
          {data.campaigns.map((campaign) => {
            const drafts = data.outreach_drafts.filter(
              (d) => d.campaign_id === campaign.id
            );
            const unique = Number(
              campaign.unique_recipient_count ??
                new Set(drafts.map((d) => d.recipient)).size
            );
            const reviewable = drafts.filter((d) =>
              data.outreach_versions.some(
                (v) => v.draft_id === d.id && v.revision === d.revision
              )
            );
            const permission =
              campaign.permission_revision === campaign.revision &&
              new Date(campaign.permission_expires_at).getTime() > Date.now();
            const edit = editing?.campaign_id === campaign.id ? editing : null;
            return (
              <section className="ii-card ii-result" key={campaign.id}>
                <h2>{campaign.name}</h2>
                <p>
                  {campaign.draft_count ?? drafts.length} drafts · {unique}{" "}
                  unique recipients · Showing {drafts.length} recent previews ·{" "}
                  {permission
                    ? `Sending authorized up to ${
                        campaign.send_limit
                      } unique recipients until ${new Date(
                        campaign.permission_expires_at
                      ).toLocaleString()}`
                    : "Sending not authorized"}
                  {campaign.cancelled ? " · Campaign cancelled" : ""}
                </p>
                {!campaign.cancelled && (
                  <form
                    key={edit?.id || "new"}
                    className="ii-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = e.currentTarget;
                      void save(
                        {
                          action: "draft.save",
                          campaign_id: campaign.id,
                          id: edit?.id || null,
                          revision: edit?.revision || null,
                          recipient: field(f, "email"),
                          company: field(f, "company"),
                          subject: field(f, "subject"),
                          body: field(f, "body"),
                        },
                        () => {
                          setEditing(null);
                          f.reset();
                        }
                      );
                    }}
                  >
                    <h3>
                      {edit
                        ? "Edit draft — approval will reset"
                        : "Prepare a message"}
                    </h3>
                    <label>
                      Exact destination email
                      <input
                        name="email"
                        type="email"
                        maxLength={254}
                        defaultValue={edit?.recipient}
                        required
                      />
                    </label>
                    <label>
                      Company
                      <input
                        name="company"
                        maxLength={200}
                        defaultValue={edit?.company}
                        required
                      />
                    </label>
                    <label>
                      Subject
                      <input
                        name="subject"
                        maxLength={200}
                        defaultValue={edit?.subject}
                        required
                      />
                    </label>
                    <label>
                      Full message
                      <textarea
                        name="body"
                        maxLength={10000}
                        defaultValue={edit?.body}
                        required
                      />
                    </label>
                    <p>
                      The fixed unsubscribe footer will appear in the saved
                      preview before approval.
                    </p>
                    <button disabled={busy}>Save for review</button>
                    {edit && (
                      <button type="button" onClick={() => setEditing(null)}>
                        Cancel edit
                      </button>
                    )}
                  </form>
                )}
                {drafts.map((draft) => {
                  const version = data.outreach_versions.find(
                    (v) =>
                      v.draft_id === draft.id && v.revision === draft.revision
                  );
                  return (
                    <article className="ii-card ii-result" key={draft.id}>
                      <label className="ii-check">
                        <input
                          type="checkbox"
                          disabled={!version}
                          checked={selected.includes(draft.id)}
                          onChange={(e) =>
                            setSelected((s) =>
                              e.target.checked
                                ? [...s, draft.id]
                                : s.filter((id) => id !== draft.id)
                            )
                          }
                        />{" "}
                        Select this message
                      </label>
                      <small>
                        {draft.review} · Version {draft.revision}
                      </small>
                      <h3>{draft.company}</h3>
                      <p>To: {draft.recipient}</p>
                      <h4>{draft.subject}</h4>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {version?.final_body || draft.body}
                      </p>
                      <div className="ii-actions">
                        <button
                          disabled={busy || campaign.cancelled}
                          onClick={() => setEditing(draft)}
                        >
                          Edit
                        </button>
                        <button
                          disabled={busy || campaign.cancelled || !version}
                          onClick={() =>
                            void save({
                              action: "draft.review",
                              id: draft.id,
                              revision: draft.revision,
                              approve: true,
                            })
                          }
                        >
                          Approve this version
                        </button>
                        <button
                          disabled={busy || campaign.cancelled || !version}
                          onClick={() =>
                            void save({
                              action: "draft.review",
                              id: draft.id,
                              revision: draft.revision,
                              approve: false,
                            })
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
                {reviewable.some((d) => selected.includes(d.id)) &&
                  !campaign.cancelled && (
                    <div className="ii-actions">
                      <button
                        disabled={busy}
                        onClick={() =>
                          void save(
                            {
                              action: "draft.review_many",
                              campaign_id: campaign.id,
                              items: reviewable
                                .filter((d) => selected.includes(d.id))
                                .map((d) => ({
                                  id: d.id,
                                  revision: d.revision,
                                })),
                              approve: true,
                            },
                            () => setSelected([])
                          )
                        }
                      >
                        Approve{" "}
                        {
                          reviewable.filter((d) => selected.includes(d.id))
                            .length
                        }{" "}
                        selected versions
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          void save(
                            {
                              action: "draft.review_many",
                              campaign_id: campaign.id,
                              items: reviewable
                                .filter((d) => selected.includes(d.id))
                                .map((d) => ({
                                  id: d.id,
                                  revision: d.revision,
                                })),
                              approve: false,
                            },
                            () => setSelected([])
                          )
                        }
                      >
                        Reject selected
                      </button>
                    </div>
                  )}
                {data.capabilities.sending && !campaign.cancelled && (
                  <form
                    className="ii-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void save({
                        action: "campaign.permission",
                        id: campaign.id,
                        revision: campaign.revision,
                        allow_send: true,
                        limit: Number(field(e.currentTarget, "limit")),
                      });
                    }}
                  >
                    <label>
                      Maximum unique recipients
                      <input
                        name="limit"
                        type="number"
                        min={1}
                        max={50}
                        required
                        defaultValue={Math.max(1, Math.min(unique, 50))}
                      />
                    </label>
                    <label className="ii-check">
                      <input type="checkbox" required /> I authorize delivery of
                      approved versions in this campaign for the next 24 hours
                      within this limit. I have reviewed the recipients and
                      sending basis.
                    </label>
                    <button disabled={busy}>
                      Grant scoped sending permission
                    </button>
                  </form>
                )}
                <div className="ii-actions">
                  {permission && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void save({
                          action: "campaign.permission",
                          id: campaign.id,
                          revision: campaign.revision,
                          allow_send: false,
                          limit: 0,
                        })
                      }
                    >
                      Revoke sending permission
                    </button>
                  )}
                  {permission &&
                    data.capabilities.sending &&
                    !campaign.cancelled && (
                      <button
                        className="ii-primary"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Queue ${
                                campaign.approved_unique_count ?? 0
                              } unique approved recipients in ${
                                campaign.name
                              }, within the authorized limit? Suppressed addresses will be excluded.`
                            )
                          )
                            void save({
                              action: "campaign.queue",
                              id: campaign.id,
                              revision: campaign.revision,
                            });
                        }}
                      >
                        Queue approved messages
                      </button>
                    )}
                  {!campaign.cancelled && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void save({
                          action: "campaign.cancel",
                          id: campaign.id,
                        })
                      }
                    >
                      Cancel queued campaign work
                    </button>
                  )}
                </div>
                <p>
                  Approval does not send. Cancellation stops queued work;
                  provider requests already in flight cannot be recalled here.
                </p>
                {data.outbox
                  .filter((o) => o.campaign_id === campaign.id)
                  .map((o) => (
                    <p key={o.id}>
                      {o.recipient}: {o.status}
                      {o.provider_id ? ` · Provider ${o.provider_id}` : ""}
                      {o.error_code ? ` · ${o.error_code}` : ""}
                    </p>
                  ))}
              </section>
            );
          })}
        </>
      )}
    </section>
  );
}
