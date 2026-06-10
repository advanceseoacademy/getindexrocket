import { isTerminalStatus } from "@/lib/indexing-status";
import { prisma } from "@/lib/prisma";
import { syncTaskFromProvider } from "@/lib/sync-task";

export async function syncInProgressTasks(userId: string, limit = 20) {
  const tasks = await prisma.task.findMany({
    where: { userId, externalId: { not: null } },
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

  for (const task of needsSync.slice(0, limit)) {
    try {
      await syncTaskFromProvider(task.id, userId);
      synced++;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Sync failed");
    }
  }

  return { synced, errors, pending: needsSync.length };
}
