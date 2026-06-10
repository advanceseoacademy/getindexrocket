import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { computeReportStats, displayStatus, statusBucket } from "@/lib/indexing-status";
import { prisma } from "@/lib/prisma";
import { syncInProgressTasks } from "@/lib/sync-in-progress";
import { serializeTask } from "@/lib/tasks-serialize";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("q")?.toLowerCase().trim();
  const skipSync = searchParams.get("skipSync") === "1";

  if (!skipSync) {
    await syncInProgressTasks(auth.user.id);
  }

  const tasks = await prisma.task.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      urls: {
        select: { id: true, url: true, status: true, indexedAt: true },
      },
    },
  });

  let serialized = tasks.map(serializeTask);

  if (search) {
    serialized = serialized
      .map((task) => ({
        ...task,
        urls: task.urls.filter((u) => u.url.toLowerCase().includes(search)),
      }))
      .filter((task) => task.urls.length > 0);
  }

  if (statusFilter && statusFilter !== "all") {
    serialized = serialized
      .map((task) => ({
        ...task,
        urls: task.urls.filter(
          (u) => statusBucket(u.status) === statusBucket(statusFilter),
        ),
      }))
      .filter((task) => task.urls.length > 0);
  }

  const stats = computeReportStats(tasks.map(serializeTask));

  return NextResponse.json({ tasks: serialized, stats });
}
