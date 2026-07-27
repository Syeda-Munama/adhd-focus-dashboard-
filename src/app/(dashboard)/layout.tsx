import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { AmbientBackground } from "@/components/shared/AmbientBackground";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen bg-paper">
      <AmbientBackground />
      <header className="border-b border-paper-border bg-paper-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/focus" className="font-medium text-ink-text">
            TAP ZERO
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-ink-text-muted">
            <Link href="/dump" className="hover:text-ink-text">
              Dump
            </Link>
            <Link href="/focus" className="hover:text-ink-text">
              Focus
            </Link>
            <Link href="/history" className="hover:text-ink-text">
              History
            </Link>
            {user?.email && (
              <span className="hidden text-ink-text-muted/60 sm:inline">
                {user.email}
              </span>
            )}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="relative mx-auto max-w-3xl px-6 py-12">
        {children}
      </main>
    </div>
  );
}
