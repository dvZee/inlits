import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@remix-run/react";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/lib/supabase";
import {
  assessmentDefinitions,
  assessmentDisclaimer,
} from "@/lib/intelligence/assessments";
import type { MetaFunction } from "@remix-run/node";
import { PrivacyControls } from "@/components/intelligence/privacy";
import { Workflows } from "@/components/intelligence/workflows";
import css from "@/intelligence.css?url";
export const links = () => [{ rel: "stylesheet", href: css }];
export const meta: MetaFunction = () => [
  { title: "Inlits — Understand. Choose. Move forward." },
];
type Row = Record<string, any>;
type State = {
  personal_facts: Row[];
  assessment_sessions: Row[];
  decision_records: Row[];
  business_workspaces: Row[];
  work_goals: Row[];
};
const empty: State = {
  personal_facts: [],
  assessment_sessions: [],
  decision_records: [],
  business_workspaces: [],
  work_goals: [],
};
const tabs = ["Home", "ME", "CHOOSE", "WORK"] as const;
export default function Intelligence() {
  const { setTheme } = useTheme();
  const [workflowVersion, setWorkflowVersion] = useState(0);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Home");
  const [data, setData] = useState<State>(empty);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState<Row | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [editing, setEditing] = useState<Row | null>(null);
  const epoch = useRef(0);
  const call = useCallback(async (command?: Row) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Please sign in to continue.");
    const response = await fetch("/api/intelligence", {
      method: command ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(command ? { "Content-Type": "application/json" } : {}),
      },
      ...(command ? { body: JSON.stringify(command) } : {}),
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error || "We could not complete this request.");
    return body;
  }, []);
  const load = useCallback(async () => {
    const version = epoch.current;
    const body = await call();
    if (version === epoch.current) setData(body);
  }, [call]);
  useEffect(() => {
    let alive = true;
    const refresh = async (session: unknown) => {
      epoch.current++;
      setData(empty);
      setActive(null);
      setEditing(null);
      setSignedIn(!!session);
      setError("");
      setLoading(true);
      if (session)
        try {
          await load();
        } catch (e) {
          if (alive) setError((e as Error).message);
        }
      if (alive) setLoading(false);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (alive) void refresh(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "SIGNED_IN")
        setTimeout(() => {
          if (alive) void refresh(session);
        }, 0);
    });
    return () => {
      alive = false;
      epoch.current++;
      subscription.unsubscribe();
    };
  }, [load]);
  async function save(command: Row, done?: () => void) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    const version = epoch.current;
    try {
      const body = await call(command);
      if (version !== epoch.current) return;
      done?.();
      if (command.action === "assessment.save" && !command.complete)
        setActive(body.record);
      await load();
      setNotice("Saved.");
    } catch (e) {
      if (version === epoch.current) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const field = (form: HTMLFormElement, name: string) =>
    String(new FormData(form).get(name) || "");
  const assessment = active
    ? assessmentDefinitions.find((item) => item.id === active.assessment_id)
    : null;
  function start(id: string) {
    const previous = data.assessment_sessions.find(
      (s) => s.assessment_id === id && s.status === "in_progress"
    );
    setActive(previous || { assessment_id: id });
    setAnswers(previous?.answers || [null, null, null]);
    setNotice("");
  }
  return (
    <div className="inlits-intelligence">
      <header className="ii-header">
        <Link to="/intelligence" className="ii-brand">
          inlits<span>●</span>
        </Link>
        <nav aria-label="Personal intelligence">
          {tabs.map((item) => (
            <button
              key={item}
              aria-current={tab === item ? "page" : undefined}
              onClick={() => {
                setTab(item);
                setActive(null);
                setError("");
                setNotice("");
              }}
            >
              {item}
            </button>
          ))}
        </nav>
        <button
          aria-label="Toggle light and dark appearance"
          onClick={() =>
            setTheme(
              document.documentElement.classList.contains("dark")
                ? "light"
                : "dark"
            )
          }
        >
          Appearance
        </button>
        <Link to="/library" className="ii-library">
          Your library ↗
        </Link>
      </header>
      <main className="ii-main">
        <div className="ii-eyebrow">YOUR SPACE TO THINK CLEARLY</div>
        <h1>
          {tab === "Home"
            ? "A little more clarity."
            : tab === "ME"
            ? "A clearer picture of you."
            : tab === "CHOOSE"
            ? "Make room for a good decision."
            : "Move forward with intention."}
        </h1>
        <p className="ii-intro">
          {tab === "Home"
            ? "Understand what matters. Choose your direction. Take the next step."
            : tab === "ME"
            ? "Your context belongs to you. Keep what fits, correct what changes."
            : tab === "CHOOSE"
            ? "Keep your alternatives, reasons, and next step together."
            : "Bring a decision into your business, without starting over."}
        </p>
        {loading ? (
          <p role="status">Opening your space…</p>
        ) : !signedIn ? (
          <section className="ii-card">
            <h2>Start with what brings you here.</h2>
            <p>
              Use your existing Inlits account. Your books and saved content
              stay with you.
            </p>
            <Link className="ii-primary" to="/signin">
              Sign in
            </Link>
            <Link className="ii-secondary" to="/signup">
              Create an account
            </Link>
          </section>
        ) : (
          <>
            {error && (
              <p className="ii-error" role="alert">
                {error}{" "}
                <button
                  onClick={() => {
                    setError("");
                    void load().catch((e) => setError(e.message));
                  }}
                >
                  Try again
                </button>
              </p>
            )}
            {notice && (
              <p role="status" className="ii-notice">
                {notice}
              </p>
            )}
            {(tab === "Home" || tab === "CHOOSE" || tab === "WORK") && (
              <Workflows
                key={workflowVersion}
                mode={
                  tab === "Home" ? "home" : tab === "CHOOSE" ? "choose" : "work"
                }
                onOpenWork={() => setTab("WORK")}
                businesses={data.business_workspaces}
                onDecision={(result) => {
                  void save({
                    action: "decision.accept",
                    job_id: result.job_id,
                    selected: result.selected,
                  });
                }}
              />
            )}
            {tab === "Home" && (
              <>
                <section className="ii-card ii-feature">
                  <span className="ii-eyebrow">ONE USEFUL NEXT STEP</span>
                  <h2>
                    {data.personal_facts.length
                      ? "What would you like to move forward?"
                      : "What brings you here today?"}
                  </h2>
                  <p>
                    Begin with your current goal or a decision on your mind.
                  </p>
                  <div className="ii-actions">
                    <button className="ii-primary" onClick={() => setTab("ME")}>
                      Understand myself
                    </button>
                    <button
                      className="ii-secondary"
                      onClick={() => setTab("CHOOSE")}
                    >
                      Make a decision
                    </button>
                    <button
                      className="ii-secondary"
                      onClick={() => setTab("WORK")}
                    >
                      Run my business
                    </button>
                  </div>
                </section>
                <section className="ii-section">
                  <h2>Your recent decisions</h2>
                  {data.decision_records.length ? (
                    data.decision_records.slice(0, 3).map((d) => (
                      <article className="ii-row" key={d.id}>
                        <div>
                          <h3>{d.topic}</h3>
                          <p>{d.next_step}</p>
                        </div>
                        <button onClick={() => setTab("CHOOSE")}>
                          Revisit →
                        </button>
                      </article>
                    ))
                  ) : (
                    <p>
                      No saved decisions yet. Start with something that matters
                      to you.
                    </p>
                  )}
                </section>
              </>
            )}
            {tab === "ME" && (
              <>
                <section className="ii-section">
                  <h2>Your Personal Model</h2>
                  <p>
                    Explicit facts, interpretations, and uncertain ideas stay
                    clearly separate.
                  </p>
                  {data.personal_facts.map((f) => (
                    <article className="ii-row" key={f.id}>
                      <div>
                        <small>
                          {f.kind} · You ·{" "}
                          {new Date(f.updated_at).toLocaleDateString()}
                        </small>
                        <h3>{f.label}</h3>
                        <p>{f.value}</p>
                      </div>
                      <div className="ii-actions">
                        <button onClick={() => setEditing(f)}>Edit</button>
                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete this context and its correction history? Saved decision snapshots are retained."
                              )
                            )
                              void save({ action: "fact.delete", id: f.id });
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                  <form
                    key={editing?.id || "new"}
                    className="ii-card ii-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = e.currentTarget;
                      void save(
                        {
                          action: "fact.save",
                          ...(editing ? { id: editing.id } : {}),
                          label: field(f, "label"),
                          value: field(f, "value"),
                          kind: field(f, "kind"),
                          consent: true,
                        },
                        () => {
                          setEditing(null);
                          f.reset();
                        }
                      );
                    }}
                  >
                    <h3>
                      {editing
                        ? "Correct your context"
                        : "Add something worth knowing"}
                    </h3>
                    <label>
                      Topic
                      <input
                        name="label"
                        defaultValue={editing?.label}
                        maxLength={100}
                        placeholder="My current goal"
                        required
                      />
                    </label>
                    <label>
                      What should Inlits know?
                      <textarea
                        name="value"
                        defaultValue={editing?.value}
                        maxLength={2000}
                        required
                      />
                    </label>
                    <label>
                      How should this be understood?
                      <select
                        name="kind"
                        defaultValue={editing?.kind || "fact"}
                      >
                        <option value="fact">A fact I am providing</option>
                        <option value="inference">My interpretation</option>
                        <option value="hypothesis">An uncertain idea</option>
                      </select>
                    </label>
                    <label className="ii-check">
                      <input type="checkbox" required /> Save this in my
                      Personal Model
                    </label>
                    <div className="ii-actions">
                      <button disabled={busy} className="ii-primary">
                        Save context
                      </button>
                      {editing && (
                        <button type="button" onClick={() => setEditing(null)}>
                          Cancel edit
                        </button>
                      )}
                    </div>
                  </form>
                </section>
                <section className="ii-section">
                  <h2>A moment of reflection</h2>
                  <p>{assessmentDisclaimer}</p>
                  {assessment ? (
                    <form
                      className="ii-card ii-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void save(
                          {
                            action: "assessment.save",
                            ...(active?.id ? { id: active.id } : {}),
                            assessment: assessment.id,
                            answers,
                            complete: true,
                          },
                          () => setActive(null)
                        );
                      }}
                    >
                      <h3>{assessment.title}</h3>
                      <p>
                        Think about your recent experience. 1 = rarely true, 5 =
                        often true.
                      </p>
                      {assessment.questions.map((q, index) => (
                        <label key={q}>
                          {q}
                          <select
                            required
                            value={answers[index] ?? ""}
                            onChange={(e) =>
                              setAnswers((a) =>
                                a.map((v, i) =>
                                  i === index
                                    ? e.target.value
                                      ? Number(e.target.value)
                                      : null
                                    : v
                                )
                              )
                            }
                          >
                            <option value="">Choose an answer</option>
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>
                                {v} —{" "}
                                {
                                  [
                                    "Rarely true",
                                    "Occasionally true",
                                    "Sometimes true",
                                    "Usually true",
                                    "Often true",
                                  ][v - 1]
                                }
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                      <div className="ii-actions">
                        <button disabled={busy} className="ii-primary">
                          See my reflection
                        </button>
                        <button
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            void save({
                              action: "assessment.save",
                              ...(active?.id ? { id: active.id } : {}),
                              assessment: assessment.id,
                              answers,
                              complete: false,
                            })
                          }
                        >
                          Save progress
                        </button>
                        <button type="button" onClick={() => setActive(null)}>
                          Back
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="ii-grid">
                      {assessmentDefinitions.map((a) => (
                        <button
                          className="ii-card ii-assessment"
                          key={a.id}
                          onClick={() => start(a.id)}
                        >
                          <small>{a.domain}</small>
                          <h3>{a.title}</h3>
                          <p>3 questions · Self-reflection</p>
                          <span>
                            {data.assessment_sessions.some(
                              (s) =>
                                s.assessment_id === a.id &&
                                s.status === "in_progress"
                            )
                              ? "Resume"
                              : "Begin"}{" "}
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {data.assessment_sessions
                    .filter((s) => s.status === "completed")
                    .map((s) => (
                      <article className="ii-card ii-result" key={s.id}>
                        <small>
                          {new Date(s.created_at).toLocaleDateString()} ·
                          Version {s.version}
                        </small>
                        <h3>
                          {
                            assessmentDefinitions.find(
                              (a) => a.id === s.assessment_id
                            )?.title
                          }
                        </h3>
                        <p>{s.result?.interpretation}</p>
                        <strong>One next step</strong>
                        <p>{s.result?.next}</p>
                        <details>
                          <summary>How this was calculated</summary>
                          <p>
                            Self-reported total {s.result?.total} / 15. Each of
                            the three responses contributes equally. This is a
                            transparent reflection rule, not a validated
                            measure.
                          </p>
                        </details>
                        <button
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Save this reflection as a correctable interpretation in your Personal Model?"
                              )
                            )
                              void save({
                                action: "fact.save",
                                label: `Reflection: ${s.assessment_id}`,
                                value: s.result?.interpretation,
                                kind: "inference",
                                consent: true,
                              });
                          }}
                        >
                          Save insight to ME
                        </button>
                      </article>
                    ))}
                </section>
              </>
            )}
            {tab === "CHOOSE" && (
              <>
                <section className="ii-card">
                  <h2>Your decision memory.</h2>
                  <p>
                    This decision journal preserves your comparison and
                    reasoning. Connected research appears below when a
                    configured worker is available.
                  </p>
                </section>
                <form
                  className="ii-card ii-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.currentTarget;
                    void save(
                      {
                        action: "decision.save",
                        topic: field(f, "topic"),
                        options: [0, 1].map((i) => ({
                          name: field(f, `name${i}`),
                          fit: field(f, `fit${i}`),
                          tradeoff: field(f, `tradeoff${i}`),
                        })),
                        selected: Number(field(f, "selected")),
                        reason: field(f, "reason"),
                        next_step: field(f, "next_step"),
                        use_personal_context:
                          new FormData(f).get("context") === "on",
                      },
                      () => f.reset()
                    );
                  }}
                >
                  <h2>What are you deciding?</h2>
                  <label>
                    Decision
                    <input
                      name="topic"
                      maxLength={200}
                      required
                      placeholder="Should I hire or outsource?"
                    />
                  </label>
                  <div className="ii-grid">
                    {[0, 1].map((i) => (
                      <fieldset key={i}>
                        <legend>Option {i + 1}</legend>
                        <label>
                          Name
                          <input name={`name${i}`} maxLength={100} required />
                        </label>
                        <label>
                          Why it fits
                          <textarea
                            name={`fit${i}`}
                            maxLength={2000}
                            required
                          />
                        </label>
                        <label>
                          What I give up
                          <textarea
                            name={`tradeoff${i}`}
                            maxLength={2000}
                            required
                          />
                        </label>
                      </fieldset>
                    ))}
                  </div>
                  <label>
                    My direction
                    <select name="selected">
                      <option value="0">Option 1</option>
                      <option value="1">Option 2</option>
                    </select>
                  </label>
                  <label>
                    My reasons
                    <textarea name="reason" maxLength={2000} required />
                  </label>
                  <label>
                    One next step
                    <input name="next_step" maxLength={2000} required />
                  </label>
                  <label className="ii-check">
                    <input name="context" type="checkbox" /> Save a snapshot of
                    my Personal Model with this decision
                  </label>
                  <p className="ii-muted">
                    Snapshots keep the context you chose with the decision.
                    Later edits to ME do not rewrite that history.
                  </p>
                  <button disabled={busy} className="ii-primary">
                    Save my decision
                  </button>
                </form>
                <section className="ii-section">
                  <h2>Decision memory</h2>
                  {data.decision_records.map((d) => (
                    <article className="ii-card ii-result" key={d.id}>
                      <small>
                        {new Date(d.created_at).toLocaleDateString()}
                      </small>
                      <h3>{d.topic}</h3>
                      <p>
                        <strong>Your direction:</strong>{" "}
                        {d.options[d.selected]?.name}
                      </p>
                      <p>{d.reason}</p>
                      <details>
                        <summary>Alternatives & context</summary>
                        {d.options.map((o: Row, i: number) => (
                          <div key={i}>
                            <h4>{o.name}</h4>
                            <p>Fit: {o.fit}</p>
                            <p>Trade-off: {o.tradeoff}</p>
                          </div>
                        ))}
                        {d.evidence?.map((s: Row) => (
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
                        {d.context_snapshot.map((f: Row) => (
                          <p key={f.id}>
                            {f.label}: {f.value} ({f.kind})
                          </p>
                        ))}
                      </details>
                      <p>Next: {d.next_step}</p>
                      {d.outcome && <p>Outcome: {d.outcome}</p>}
                      <form
                        className="ii-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void save({
                            action: "decision.outcome",
                            id: d.id,
                            outcome: field(e.currentTarget, "outcome"),
                          });
                        }}
                      >
                        <label>
                          What happened?
                          <input
                            name="outcome"
                            maxLength={2000}
                            required
                            defaultValue={d.outcome || ""}
                          />
                        </label>
                        <button disabled={busy}>Save outcome</button>
                      </form>
                      <button onClick={() => setTab("WORK")}>
                        Bring this into WORK →
                      </button>
                    </article>
                  ))}
                </section>
              </>
            )}
            {tab === "WORK" && (
              <>
                <section className="ii-card">
                  <h2>A clear next step for your business.</h2>
                  <p>
                    Goals are saved plans. Connected jobs and provider outcomes
                    appear separately, with their actual status.
                  </p>
                </section>
                <form
                  className="ii-card ii-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.currentTarget;
                    void save(
                      {
                        action: "business.create",
                        name: field(f, "name"),
                        type: field(f, "type"),
                        goal: field(f, "goal"),
                      },
                      () => f.reset()
                    );
                  }}
                >
                  <h2>Your business</h2>
                  <label>
                    Business name
                    <input name="name" maxLength={100} required />
                  </label>
                  <label>
                    Business type
                    <select name="type">
                      <option value="agency">Agency</option>
                      <option value="services">B2B services</option>
                      <option value="ecommerce">Ecommerce</option>
                      <option value="creator">Creator or professional</option>
                    </select>
                  </label>
                  <label>
                    Current priority
                    <textarea name="goal" maxLength={2000} required />
                  </label>
                  <button className="ii-primary" disabled={busy}>
                    Create workspace
                  </button>
                </form>
                {data.business_workspaces.map((b) => (
                  <section className="ii-card ii-result" key={b.id}>
                    <small>{b.business_type}</small>
                    <h2>{b.name}</h2>
                    <p>{b.goal}</p>
                    <form
                      className="ii-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void save({
                          action: "goal.create",
                          business_id: b.id,
                          decision_id: field(e.currentTarget, "decision"),
                          share_context: true,
                        });
                      }}
                    >
                      <label>
                        Continue a decision
                        <select name="decision" required>
                          <option value="">Choose a saved decision</option>
                          {data.decision_records.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.topic}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="ii-check">
                        <input type="checkbox" required /> Share this decision's
                        title and next step with this business
                      </label>
                      <button disabled={busy || !data.decision_records.length}>
                        Create goal
                      </button>
                    </form>
                    {data.work_goals
                      .filter((g) => g.business_id === b.id)
                      .map((g) => (
                        <article className="ii-row" key={g.id}>
                          <div>
                            <small>
                              {g.status === "planned"
                                ? "Planned · Not executing"
                                : "Cancelled"}
                            </small>
                            <h3>{g.title}</h3>
                            <p>{g.next_step}</p>
                          </div>
                          {g.status === "planned" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void save({ action: "goal.cancel", id: g.id })
                              }
                            >
                              Cancel goal
                            </button>
                          )}
                        </article>
                      ))}
                  </section>
                ))}
              </>
            )}
          </>
        )}
        {signedIn && (
          <PrivacyControls
            onDelete={() => {
              setWorkflowVersion(v=>v+1);
              setData(empty);
              setActive(null);
              setEditing(null);
              setTab("Home");
              setNotice("Intelligence data deleted.");
            }}
          />
        )}
        <footer className="ii-footer">
          Less managing. More living.
          <span> Your information stays in your account.</span>
        </footer>
      </main>
    </div>
  );
}
