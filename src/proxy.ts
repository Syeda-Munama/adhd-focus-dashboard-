import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require a logged-in user. "/" is matched exactly
// below (not via startsWith) -- as a prefix it would match every path
// in the app, which would defeat the whole point of this list.
const PUBLIC_PATHS = ["/", "/sign-in", "/auth/callback"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies must be set on both the request (so this same
          // proxy pass sees the refreshed session) and the
          // response (so the browser actually receives it).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: this call is what actually refreshes an expiring
  // session token. Don't remove it even though we don't use `user`
  // directly below in every branch — skipping it causes random
  // logouts once the access token expires.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    path === "/"
      ? request.nextUrl.pathname === "/"
      : request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !isPublicPath) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (user && request.nextUrl.pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/dump", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next.js internals,
     * so the session-refresh logic runs on every real page/API call.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
