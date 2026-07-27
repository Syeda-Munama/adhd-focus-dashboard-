import { NextRequest, NextResponse } from "next/server";
import { prisma, getCurrentUserId } from "@/lib/db/prisma";
import type { EnergyLevel } from "@/types/task";

// Declared low-to-high on purpose: the EnergyLevel enum in
// prisma/schema.prisma is declared in this same order (LOW, MEDIUM,
// HIGH), and Postgres enums sort by their declaration order rather
// than alphabetically -- so `orderBy: { energyLevel: "asc" }` in the
// queries below naturally gives us least-demanding-first without any
// extra ranking field.
const ENERGY_RANK: Record<EnergyLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

function energyBudget(maxEnergy: EnergyLevel): EnergyLevel[] {
  const maxRank = ENERGY_RANK[maxEnergy];
  return (Object.keys(ENERGY_RANK) as EnergyLevel[]).filter(
    (level) => ENERGY_RANK[level] <= maxRank
  );
}

/**
 * The core "one task at a time" endpoint.
 *
 * Optional ?energy=LOW|MEDIUM|HIGH query param lets the frontend say
 * "I only have this much energy right now." We treat it as a budget,
 * not an exact match: LOW only surfaces LOW tasks, MEDIUM surfaces
 * LOW+MEDIUM, HIGH surfaces everything -- the idea being you should
 * never get handed something that costs more energy than you have.
 *
 * If nothing fits the budget (e.g. everything left needs HIGH energy
 * and the user asked for LOW), we don't report an empty queue -- that
 * would look like a bug, not an honest "nothing easy left." Instead we
 * fall back to the least-demanding task available and flag
 * `matchedEnergy: false` so the UI can be honest about the mismatch.
 */
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const requestedEnergy = req.nextUrl.searchParams.get("energy") as
    | EnergyLevel
    | null;

  // Un-snooze anything whose snooze window has passed.
  await prisma.task.updateMany({
    where: {
      userId,
      status: "SNOOZED",
      snoozedUntil: { lte: new Date() },
    },
    data: { status: "PENDING", snoozedUntil: null },
  });

  let nextTask = null;
  let matchedEnergy = true;

  if (requestedEnergy && ENERGY_RANK[requestedEnergy]) {
    nextTask = await prisma.task.findFirst({
      where: {
        userId,
        status: "PENDING",
        energyLevel: { in: energyBudget(requestedEnergy) },
      },
      orderBy: [{ priority: "desc" }, { energyLevel: "asc" }, { orderIndex: "asc" }],
    });

    if (!nextTask) {
      matchedEnergy = false;
    }
  }

  // Either no energy filter was requested, or nothing fit the budget --
  // fall back to the easiest task available so the queue never looks
  // emptier than it really is.
  if (!nextTask) {
    nextTask = await prisma.task.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: requestedEnergy
        ? [{ energyLevel: "asc" }, { priority: "desc" }, { orderIndex: "asc" }]
        : [{ priority: "desc" }, { orderIndex: "asc" }],
    });
  }

  const pendingCount = await prisma.task.count({
    where: { userId, status: "PENDING" },
  });

  return NextResponse.json({
    task: nextTask,
    remainingCount: pendingCount,
    matchedEnergy,
  });
}
