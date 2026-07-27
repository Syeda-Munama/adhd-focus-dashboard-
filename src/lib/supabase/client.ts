import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client. Use this inside "use client" components
 * (forms, buttons that call supabase.auth.* directly). It reads/writes
 * the session via browser cookies automatically.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
