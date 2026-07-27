import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client. Use this in Server Components, Route
 * Handlers, and Server Actions — anywhere you have access to
 * next/headers cookies(). It reads the session from the incoming
 * request's cookies, and can write refreshed session cookies back
 * (Route Handlers/Server Actions can set cookies; plain Server
 * Components can only read them — that's fine, middleware handles
 * the refresh in that case).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component sometimes, where
            // cookies() is read-only. Safe to ignore — middleware.ts
            // is responsible for refreshing the session cookie there.
          }
        },
      },
    }
  );
}
