import { normalizeApiStatus } from "@/lib/indexing-status";
import { getTaskStatus } from "@/lib/indexnowfast";
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
  if (!task.externalId) return task;

  const remote = await getTaskStatus(task.externalId);
  const urlMap = new Map(task.urls.map((u) => [normalizeUrl(u.url), u]));

  await prisma.$transaction(async (tx) => {
    const providerRef = remote.task.provider_task_id
      ? String(remote.task.provider_task_id)
      : undefined;

    await tx.task.update({
      where: { id: task.id },
      data: {
        status: normalizeApiStatus(remote.task.status),
        urlsCount: remote.task.urls_count ?? task.urlsCount,
        creditsCharged: remote.task.credits_charged ?? task.creditsCharged,
        tier: remote.task.tier ?? task.tier,
        ...(providerRef ? { providerTaskId: providerRef } : {}),
      },
    });

    for (const remoteUrl of remote.urls) {
      let local = urlMap.get(normalizeUrl(remoteUrl.url));
      if (!local) {
        local = task.urls.find(
          (u) => u.url.trim().toLowerCase() === remoteUrl.url.trim().toLowerCase(),
        );
      }
      if (!local) continue;
      await tx.taskUrl.update({
        where: { id: local.id },
        data: {
          status: normalizeApiStatus(remoteUrl.status),
          indexedAt: remoteUrl.indexed_at ? new Date(remoteUrl.indexed_at) : null,
        },
      });
    }
  });

  return prisma.task.findUnique({
    where: { id: task.id },
    include: { urls: true },
  });
}
