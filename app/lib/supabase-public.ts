// These are the existing project's public credentials, not a service-role secret.
export const legacyPublicSupabase = {
  url: "https://yvjrakgbqqazedjltflw.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2anJha2dicXFhemVkamx0Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjIyNTIsImV4cCI6MjA1MjY5ODI1Mn0.tFpht9qLcCeilgnd9vmbF4abiJi96FvzmGZCOXL2DiU",
};
export function assertPublicKey(key: string) {
  if (key.startsWith("sb_publishable_")) return;
  try {
    const payload = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.role === "anon") return;
  } catch {}
  throw new Error(
    "Public Supabase configuration must use an anonymous or publishable key."
  );
}
export function getPublicSupabaseConfig(
  env: Record<string, string | undefined>
) {
  if (!!env.SUPABASE_URL !== !!env.SUPABASE_ANON_KEY)
    throw new Error("Configure both public Supabase URL and anonymous key.");
  const config = {
    url: env.SUPABASE_URL || legacyPublicSupabase.url,
    anonKey: env.SUPABASE_ANON_KEY || legacyPublicSupabase.anonKey,
  };
  const url = new URL(config.url);
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Public Supabase URL must use HTTPS.");
  assertPublicKey(config.anonKey);
  return config;
}
declare global {
  interface Window {
    __INLITS_PUBLIC_CONFIG__?: typeof legacyPublicSupabase;
  }
}
