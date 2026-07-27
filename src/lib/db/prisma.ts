import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";

// Standard Next.js dev-mode singleton so hot-reload doesn't spawn
// a new PrismaClient (and a new connection pool) on every save.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Returns the currently authenticated user's id, matching Supabase's
 * auth user id (a UUID). Also ensures a corresponding row exists in
 * our own `User` table (needed for the Task/Dump/FocusSession foreign
 * keys) -- created lazily on first call after signup, so there's no
 * separate "create profile" step to remember.
 *
 * Throws if nobody is logged in. Routes calling this expect
 * middleware.ts to have already redirected unauthenticated requests
 * to /sign-in, so reaching here without a session means something's
 * wrong (e.g. an API route hit directly without cookies) -- better to
 * fail loudly than silently operate as the wrong user.
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email },
  });

  return user.id;
}
