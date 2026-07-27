import { NextRequest, NextResponse } from "next/server";
import { prisma, getCurrentUserId } from "@/lib/db/prisma";

const SNOOZE_MINUTES = 60;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = body?.action as
    | "complete"
    | "skip"
    | "snooze"
    | "start"
    | undefined;

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  switch (action) {
    case "start": {
      const updated = await prisma.task.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
      await prisma.focusSession.create({
        data: { taskId: id, userId },
      });
      return NextResponse.json({ task: updated });
    }

    case "complete": {
      const updated = await prisma.task.update({
        where: { id },
        data: { status: "DONE", completedAt: new Date() },
      });
      const openSession = await prisma.focusSession.findFirst({
        where: { taskId: id, endedAt: null },
        orderBy: { startedAt: "desc" },
      });
      if (openSession) {
        await prisma.focusSession.update({
          where: { id: openSession.id },
          data: { endedAt: new Date(), wasCompleted: true },
        });
      }
      return NextResponse.json({ task: updated });
    }

    case "skip": {
      // Move it to the back of the queue rather than deleting it —
      // "skip" should feel low-stakes and reversible, never punitive.
      const lastTask = await prisma.task.findFirst({
        where: { userId },
        orderBy: { orderIndex: "desc" },
      });
      const updated = await prisma.task.update({
        where: { id },
        data: {
          status: "PENDING",
          orderIndex: (lastTask?.orderIndex ?? 0) + 1,
        },
      });
      return NextResponse.json({ task: updated });
    }

    case "snooze": {
      const updated = await prisma.task.update({
        where: { id },
        data: {
          status: "SNOOZED",
          snoozedUntil: new Date(Date.now() + SNOOZE_MINUTES * 60_000),
        },
      });
      return NextResponse.json({ task: updated });
    }

    default:
      return NextResponse.json(
        { error: "action must be one of: start, complete, skip, snooze" },
        { status: 400 }
      );
  }
}
