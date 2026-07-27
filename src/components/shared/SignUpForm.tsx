"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const nextPath = searchParams.get("next") ?? "/dump";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [state, setState] = useState<
    "idle" | "signing-up" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setState("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setState("error");
      return;
    }

    setState("signing-up");
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
       options: {
  emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dump`,
}
    });

    if (error) {
      setMessage(error.message);
      setState("error");
      return;
    }

    // If email confirmation is disabled in Supabase,
    // the user will already be logged in.
    if (data.session) {
      router.push(nextPath);
      router.refresh();
      return;
    }

    // If email confirmation is enabled,
    // Supabase may require email verification.
    setMessage(
      "Account created. Please check your email to confirm your account."
    );

    setState("success");
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-ink-text-muted hover:text-ink-text"
      >
        ← back
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-xl font-medium text-ink-text">
              Create your account
            </h1>

            <p className="mt-1 text-sm text-ink-text-muted">
              Start building your task list.
            </p>
          </div>

          {state === "success" ? (
            <p className="text-center text-sm text-ink-text">
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-[16px] border border-paper-border px-4 py-3 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-clarity"
                disabled={state === "signing-up"}
              />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-[16px] border border-paper-border px-4 py-3 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-clarity"
                disabled={state === "signing-up"}
              />

              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-[16px] border border-paper-border px-4 py-3 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-clarity"
                disabled={state === "signing-up"}
              />

              <Button
                type="submit"
                disabled={state === "signing-up"}
              >
                {state === "signing-up"
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </form>
          )}

          {message && state === "error" && (
            <p className="text-center text-sm text-alert">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-ink-text-muted">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-ink-text underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}