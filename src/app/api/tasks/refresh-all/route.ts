import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/tasks-serialize";
import { syncInProgressTasks } from "@/lib/sync-in-progress";

export async function POST() {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { synced, errors } = await syncInProgressTasks(auth.user.id);

  const updated = await prisma.task.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      urls: { select: { id: true, url: true, status: true, indexedAt: true } },
    },
  });

  return NextResponse.json({
    synced,
    errors: errors.slice(0, 3),
    tasks: updated.map(serializeTask),
  });
}
