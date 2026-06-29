import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  BookOpen,
  Lock,
  Plus,
  Send,
} from "lucide-react";

interface BookRequest {
  id: string;
  book_title: string;
  book_author: string | null;
  notes: string | null;
  status: "pending" | "completed" | "rejected";
  created_at: string;
}

export function RequestBookPage() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [notes, setNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isPremium =
    profile?.subscription_status === "active" || profile?.role === "creator";

  const fetchRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("book_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching book requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isPremium) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user, isPremium]);

  // Calculate current month's requests
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const thisMonthRequests = requests.filter(
    (r) => new Date(r.created_at) >= startOfMonth
  );
  const requestsLeft = Math.max(0, 3 - thisMonthRequests.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isPremium) return;
    if (requestsLeft <= 0) {
      setErrorMsg("You have reached your limit of 3 requests for this month.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Book title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      const { error } = await supabase.from("book_requests").insert({
        user_id: user.id,
        book_title: title.trim(),
        book_author: author.trim() || null,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      setSuccessMsg(
        "Request submitted successfully! We will research, write, and upload your summary in the next 72 hours."
      );
      setTitle("");
      setAuthor("");
      setNotes("");
      fetchRequests();
    } catch (err) {
      console.error("Error submitting request:", err);
      setErrorMsg("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. FREE USER GATE VIEW
  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card/95 border border-primary/20 rounded-2xl shadow-2xl relative overflow-hidden bg-gradient-to-br from-amber-500/5 via-background to-primary/5 p-8 md:p-12 text-center space-y-8">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -ml-24 -mb-24" />

          {/* Premium Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-semibold text-xs border border-amber-500/20 uppercase tracking-wider mx-auto">
            <Lock className="w-3 h-3" /> Premium Feature
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-foreground to-primary bg-clip-text text-transparent">
              Can't Find Your Favorite Book?
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Inlits Premium isn’t just a library—it’s a dynamic learning platform tailored to you. As a Premium member, you can request any book summary and our team of expert creators will research, write, and record it for you in under 72 hours.
            </p>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left pt-4">
            <div className="bg-background/40 border border-border/60 rounded-xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-bold text-foreground text-sm">72-Hour Turnaround</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We prioritize your growth. Once requested, your book summary is live in 72 hours.
              </p>
            </div>
            <div className="bg-background/40 border border-border/60 rounded-xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Full Audio & Text</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive a professional Urdu audiobook summary and structured key-point text guide.
              </p>
            </div>
            <div className="bg-background/40 border border-border/60 rounded-xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-bold text-foreground text-sm">3 Requests Monthly</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct the content of the platform by requesting up to 3 summaries every month.
              </p>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="pt-6">
            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/20 hover:shadow-lg active:scale-[0.98] text-sm"
            >
              Invest in Myself & Upgrade
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. PREMIUM USER DASHBOARD
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Request a Book Summary
            </h1>
            <p className="text-sm text-muted-foreground">
              Tell us what you want to learn next. We will upload the summary in the next 72 hours.
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-center flex-shrink-0">
            <span className="block text-2xl font-extrabold text-amber-500">
              {requestsLeft}
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
              Requests Left This Month
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form Container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" /> New Request
            </h2>

            {requestsLeft <= 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg p-4 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">
                    Monthly Limit Reached
                  </span>
                  You have already requested 3 book summaries in this calendar month. Your request limit will reset at the start of next month.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="title"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Book Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    disabled={submitting}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Atomic Habits"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="author"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Author Name
                  </label>
                  <input
                    id="author"
                    type="text"
                    disabled={submitting}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. James Clear"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="notes"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Why do you want this summary? (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    disabled={submitting}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us what key points you want to focus on..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 resize-none"
                  />
                </div>

                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg p-3 text-xs sm:text-sm flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info/Rules */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm">How it works</h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Submit the title and author of the book summary you want.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Our research and scriptwriting team will outline the key lessons.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>A professional voiceover artist will record the summary in audio format.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-amber-500 font-semibold">The summary is uploaded and goes live within 72 hours.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Request History</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              You haven't requested any books yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {request.book_title}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {request.book_author || "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                          request.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : request.status === "rejected"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
