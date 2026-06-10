import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildCreditSpending } from "@/lib/credit-spending";
import { computeReportStats } from "@/lib/indexing-status";
import { prisma } from "@/lib/prisma";
import { syncInProgressTasks } from "@/lib/sync-in-progress";
import { serializeTask } from "@/lib/tasks-serialize";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status! });
  }

  const skipSync = new URL(request.url).searchParams.get("skipSync") === "1";

  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  if (!skipSync) {
    await syncInProgressTasks(auth.user.id);
  }

  const [tasks, spendingRows] = await Promise.all([
    prisma.task.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        urls: {
          select: { id: true, url: true, status: true, indexedAt: true },
        },
      },
    }),
    prisma.creditTransaction.findMany({
      where: {
        userId: auth.user.id,
        amount: { lt: 0 },
        createdAt: { gte: since },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const serialized = tasks.map(serializeTask);
  const stats = computeReportStats(serialized);

  return NextResponse.json({
    user: auth.user,
    stats: {
      creditBalance: auth.user.creditBalance,
      totalSubmitted: stats.totalUrls,
      taskCount: stats.totalTasks,
      successRate: stats.successRate,
      disappeared: stats.failed + stats.refunded,
      processing: stats.inProgress,
      completed: stats.crawled,
      failed: stats.failed,
    },
    recentTasks: serialized.slice(0, 8),
    creditSpending: buildCreditSpending(spendingRows),
  });
}
