import type { IndexingTier } from "@/lib/brand";
import { isTerminalStatus, statusBucket } from "@/lib/indexing-status";
import { prisma } from "@/lib/prisma";

export type SubmitTaskResponse = {
  task_id: string;
  urls_count: number;
  credits_charged: number;
  tier: IndexingTier;
  status: string;
};

export type TaskUrlStatus = {
  url: string;
  status: string;
  indexed_at: string | null;
};

export type TaskDetailResponse = {
  task: {
    id: string;
    provider_task_id?: string | number | null;
    status: string;
    urls_count: number;
    credits_charged: number;
    tier: IndexingTier;
    created_at?: string;
  };
  urls: TaskUrlStatus[];
};

function aggregateTaskStatus(urlStatuses: string[]): string {
  if (urlStatuses.length === 0) return "pending";

  const buckets = urlStatuses.map((s) => statusBucket(s));
  if (buckets.every((b) => b === "crawled")) return "crawled";
  if (buckets.every((b) => b === "refunded")) return "refunded";
  if (buckets.every((b) => b === "failed")) return "failed";
  if (buckets.some((b) => b === "crawled")) return "processing";
  if (buckets.some((b) => b === "discovered" || b === "processing")) return "processing";
  if (buckets.some((b) => b === "submitted")) return "submitted";
  if (buckets.some((b) => b === "refunded")) return "processing";
  return "pending";
}

/** Local status read — drop-in shape for legacy sync code. */
export async function getTaskStatus(taskIdOrExternalId: string): Promise<TaskDetailResponse> {
  const task = await prisma.task.findFirst({
    where: {
      OR: [{ id: taskIdOrExternalId }, { externalId: taskIdOrExternalId }],
    },
    include: { urls: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return {
    task: {
      id: task.id,
      provider_task_id: task.providerTaskId ?? task.id.slice(-6).toUpperCase(),
      status: task.status,
      urls_count: task.urlsCount,
      credits_charged: task.creditsCharged,
      tier: (task.tier as IndexingTier) ?? "standard",
      created_at: task.createdAt.toISOString(),
    },
    urls: task.urls.map((u) => ({
      url: u.url,
      status: u.status,
      indexed_at: u.indexedAt?.toISOString() ?? null,
    })),
  };
}

export async function refreshTaskAggregateStatus(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { urls: true },
  });
  if (!task) return null;

  const nextStatus = aggregateTaskStatus(task.urls.map((u) => u.status));
  if (nextStatus === task.status) return task;

  return prisma.task.update({
    where: { id: taskId },
    data: { status: nextStatus },
    include: { urls: true },
  });
}

export function isLocalTask(task: { externalId: string | null; id: string }): boolean {
  if (!task.externalId) return true;
  return task.externalId === task.id;
}

export function taskNeedsSync(task: {
  status: string;
  urls: { status: string }[];
}): boolean {
  if (!isTerminalStatus(task.status)) return true;
  return task.urls.some((u) => !isTerminalStatus(u.status));
}
