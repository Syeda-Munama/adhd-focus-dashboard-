import { NextResponse } from "next/server";
import { prisma, getCurrentUserId } from "@/lib/db/prisma";

export async function GET() {
  const userId = await getCurrentUserId();

  const completedTasks = await prisma.task.findMany({
    where: { userId, status: "DONE" },
    orderBy: { completedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ tasks: completedTasks });
}
