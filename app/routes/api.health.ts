import { json } from "@remix-run/node";
export async function loader() {
  return json(
    {
      web: "ok",
      database_configured:
        !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
      release: process.env.INLITS_RELEASE_SHA || "unversioned",
      note: "Database connectivity and worker readiness require authenticated workflow health checks.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
