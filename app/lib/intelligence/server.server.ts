import { assertPublicKey } from "../supabase-public";
import { createClient } from "@supabase/supabase-js";
import { json } from "@remix-run/node";
// User JWT, never a service role: Postgres RLS remains authoritative.
export async function authenticate(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length > 8192)
    throw json(
      { error: "Please sign in to continue." },
      { status: 401, headers: privateHeaders }
    );
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key)
    throw json(
      { error: "Personal intelligence is not configured on this environment." },
      { status: 503, headers: privateHeaders }
    );
  assertPublicKey(key);
  const db = createClient(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await db.auth.getUser(authorization.slice(7));
  if (error || !user)
    throw json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401, headers: privateHeaders }
    );
  return { db, user };
}
export function databaseError(error: { code?: string }): never {
  if (["42P01", "PGRST205", "PGRST202"].includes(error.code || ""))
    throw json(
      {
        error:
          "Personal intelligence is awaiting database setup. Your existing account is unchanged.",
      },
      { status: 503, headers: privateHeaders }
    );
  throw json(
    {
      error:
        "We could not save or retrieve this information. Please try again.",
    },
    { status: 500, headers: privateHeaders }
  );
}
export const privateHeaders = {
  "Cache-Control": "no-store, private",
  Vary: "Authorization",
  "X-Content-Type-Options": "nosniff",
};
