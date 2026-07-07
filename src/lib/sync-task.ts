import { refreshTaskAggregateStatus } from "@/lib/indexer/engine";
import { processTask } from "@/lib/indexer/run";
import { prisma } from "@/lib/prisma";

export function normalizeUrl(url: string) {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    const path = u.pathname.replace(/\/$/, "") || "/";
    return `${u.protocol}//${u.hostname.toLowerCase()}${path}${u.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

export async function syncTaskFromProvider(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { urls: true },
  });

  if (!task) return null;

  await processTask(task.id);
  await refreshTaskAggregateStatus(task.id);

  return prisma.task.findUnique({
    where: { id: task.id },
    include: { urls: true },
  });
}
