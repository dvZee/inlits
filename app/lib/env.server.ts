export function getEnv() {
  return {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  };
}

export function validateEnv() {
  const env = getEnv();

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      `Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Netlify environment variables.`
    );
  }

  return env;
}
