import type { Task, TaskUrl } from "@prisma/client";

export type SerializedTaskUrl = {
  id: string;
  url: string;
  status: string;
  indexedAt: string | null;
};

export type SerializedTask = {
  id: string;
  externalId: string | null;
  providerTaskId: string | null;
  tier: string;
  status: string;
  urlsCount: number;
  creditsCharged: number;
  createdAt: string;
  urls: SerializedTaskUrl[];
};

export function serializeTask(
  task: Task & { urls: Pick<TaskUrl, "id" | "url" | "status" | "indexedAt">[] },
): SerializedTask {
  return {
    id: task.id,
    externalId: task.externalId,
    providerTaskId: task.providerTaskId ?? null,
    tier: task.tier,
    status: task.status,
    urlsCount: task.urlsCount,
    creditsCharged: task.creditsCharged,
    createdAt: task.createdAt.toISOString(),
    urls: task.urls.map((u) => ({
      id: u.id,
      url: u.url,
      status: u.status,
      indexedAt: u.indexedAt?.toISOString() ?? null,
    })),
  };
}
