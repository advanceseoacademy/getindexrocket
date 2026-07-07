import { isTerminalStatus } from "@/lib/indexing-status";
import { prisma } from "@/lib/prisma";
import { syncTaskFromProvider } from "@/lib/sync-task";

export async function syncInProgressTasks(userId: string, limit = 20) {
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: { urls: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const needsSync = tasks.filter(
    (t) =>
      !isTerminalStatus(t.status) ||
      t.urls.some((u) => !isTerminalStatus(u.status)),
  );

  let synced = 0;
  const errors: string[] = [];
  const batch = needsSync.slice(0, limit);
  const concurrency = 3;

  for (let i = 0; i < batch.length; i += concurrency) {
    const chunk = batch.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      chunk.map((task) => syncTaskFromProvider(task.id, userId)),
    );
    for (const result of results) {
      if (result.status === "fulfilled") synced++;
      else errors.push(result.reason instanceof Error ? result.reason.message : "Sync failed");
    }
  }

  return { synced, errors, pending: needsSync.length };
}
