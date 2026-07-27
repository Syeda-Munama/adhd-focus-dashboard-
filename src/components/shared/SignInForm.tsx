"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type State = "idle" | "sending" | "sent" | "error";

export function SignInForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dump";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState(initialError ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;

    setState("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Where Supabase redirects after the user clicks the email
        // link. Our callback route exchanges the code and forwards
        // them on to wherever they were trying to go.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`,
      },
    });

    if (error) {
      setMessage(error.message);
      setState("error");
      return;
    }

    setState("sent");
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
            <h1 className="text-xl font-medium text-ink-text">clarity</h1>
            <p className="mt-1 text-sm text-ink-text-muted">
              One task at a time. Sign in to get started.
            </p>
          </div>

          {state === "sent" ? (
            <p className="text-center text-sm text-ink-text">
              Check <span className="font-medium">{email}</span> for a
              sign-in link. You can close this tab.
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
                disabled={state === "sending"}
              />
              <Button type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Sending link..." : "Send magic link"}
              </Button>
            </form>
          )}

          {message && (
            <p className="text-center text-sm text-alert">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}