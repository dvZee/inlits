import { useState } from "react";
import { supabase } from "@/lib/supabase";
export function PrivacyControls({ onDelete }: { onDelete: () => void }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function perform(remove: boolean) {
    setBusy(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in first.");
      const response = await fetch("/api/intelligence-privacy", {
        method: remove ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          ...(remove ? { "Content-Type": "application/json" } : {}),
        },
        ...(remove
          ? {
              body: JSON.stringify({
                confirmation: "DELETE INTELLIGENCE DATA",
              }),
            }
          : {}),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Request failed.");
      }
      if (remove) onDelete();
      else {
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement("a");
        link.href = url;
        link.download = "inlits-intelligence-data.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="ii-section">
      <summary>Privacy & your data</summary>
      <p>
        Export all your intelligence records, including saved context,
        historical snapshots, assessments, jobs and outreach. Deleting this data
        clears those records; your audiobook account and library remain. Emails
        already submitted cannot be recalled.
      </p>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} onClick={() => void perform(false)}>
        Export my intelligence data
      </button>
      <form
        className="ii-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            window.confirm(
              "Permanently delete your intelligence records and business workspaces? This cannot be undone here."
            )
          )
            void perform(true);
        }}
      >
        <label>
          Type DELETE INTELLIGENCE DATA to delete these records
          <input
            pattern="DELETE INTELLIGENCE DATA"
            required
            autoComplete="off"
          />
        </label>
        <button disabled={busy}>Delete intelligence data</button>
      </form>
    </details>
  );
}
