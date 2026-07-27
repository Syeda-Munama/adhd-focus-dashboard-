import { NextRequest, NextResponse } from "next/server";
import { prisma, getCurrentUserId } from "@/lib/db/prisma";
import { parseDump } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();

  const body = await req.json().catch(() => null);
  const rawText = body?.rawText?.trim();

  if (!rawText) {
    return NextResponse.json(
      { error: "rawText is required." },
      { status: 400 }
    );
  }

  // Save the raw dump first, before calling the AI, so nothing is
  // ever lost even if the AI call fails or times out.
  const dump = await prisma.dump.create({
    data: { userId, rawText, processed: false },
  });

  try {
    const { tasks, ignoredNotes } = await parseDump(rawText);

    // Push new tasks to the back of the queue, after whatever's
    // already pending, rather than reordering existing work.
    const lastTask = await prisma.task.findFirst({
      where: { userId },
      orderBy: { orderIndex: "desc" },
    });
    let nextOrderIndex = (lastTask?.orderIndex ?? -1) + 1;

    const createdTasks = await prisma.$transaction(
      tasks.map((t) =>
        prisma.task.create({
          data: {
            userId,
            dumpId: dump.id,
            title: t.title,
            description: t.description ?? null,
            category: t.category,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
            energyLevel: t.energyLevel,
            orderIndex: nextOrderIndex++,
          },
        })
      )
    );

    await prisma.dump.update({
      where: { id: dump.id },
      data: { processed: true },
    });

    return NextResponse.json({
      dumpId: dump.id,
      tasks: createdTasks,
      ignoredNotes: ignoredNotes ?? [],
    });
  } catch (err) {
    console.error("[parse-dump] AI parsing failed:", err);
    await prisma.dump.update({
      where: { id: dump.id },
      data: {
        error: err instanceof Error ? err.message : "Unknown error",
      },
    });
    return NextResponse.json(
      {
        error:
          "Couldn't process that dump right now. It's saved — you can retry from history.",
        dumpId: dump.id,
      },
      { status: 502 }
    );
  }
}
