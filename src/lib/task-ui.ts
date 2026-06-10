import {
  getStatusStyle,
  isSuccessStatus,
  isTerminalStatus,
  statusBucket,
  displayStatus,
} from "@/lib/indexing-status";
import type { SerializedTask } from "@/lib/tasks-serialize";

export type TaskTab = "all" | "processing" | "completed" | "failed";

export type TaskRowStatus = "processing" | "completed" | "failed";

export function formatTaskId(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

/** Public task ref — matches provider dashboard (#357087) when synced. */
export function formatTaskPublicId(task: SerializedTask) {
  if (task.providerTaskId) return `#${task.providerTaskId}`;
  return formatTaskId(task.id);
}

export function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatTaskDate(iso);
}

export function formatTaskDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUrlDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTaskTitle(task: SerializedTask) {
  if (task.urlsCount === 1 && task.urls[0]) {
    try {
      const host = new URL(task.urls[0].url).hostname.replace(/^www\./, "");
      return host;
    } catch {
      return "1 URL";
    }
  }
  return `${task.urlsCount} URLs`;
}

export function getTaskIconLetter(task: SerializedTask) {
  return getTaskTitle(task).charAt(0).toUpperCase();
}

/** Provider list badge: CRAWLED only when the task is fully done — not from URL counts alone. */
export function getTaskListStatus(task: SerializedTask): string {
  const taskLevel = statusBucket(task.status);

  if (taskLevel === "failed") return "failed";
  if (taskLevel === "refunded") return "refunded";

  if (taskLevel === "crawled") {
    const allUrlsDone =
      task.urls.length > 0 &&
      task.urls.every((u) => isSuccessStatus(u.status) || Boolean(u.indexedAt));
    return allUrlsDone ? "crawled" : "processing";
  }

  return "processing";
}

export function isProviderTaskComplete(task: SerializedTask) {
  return getTaskListStatus(task) === "crawled";
}

/**
 * Provider dashboard labels (API `completed`/`indexed` → UI **CRAWLED**).
 * @see indexing-status.ts normalizeApiStatus
 */
export function getTaskDisplayBadge(task: SerializedTask) {
  const status = getTaskListStatus(task);
  const style = getStatusStyle(status);
  return { status, ...style, processing: status === "processing" };
}

/** Per-URL badge in task detail — mirrors provider link status labels. */
export function getUrlDisplayBadge(url: SerializedTask["urls"][number]) {
  const bucket = statusBucket(url.status);
  const style = getStatusStyle(url.status);
  const processing = ["processing", "pending", "submitted", "discovered"].includes(bucket);
  return { bucket, ...style, processing };
}

export function getTaskProgress(task: SerializedTask) {
  const total = task.urls.length || task.urlsCount;
  const crawled = task.urls.filter((u) => statusBucket(u.status) === "crawled").length;
  const taskComplete = isProviderTaskComplete(task);

  // Provider: while PROCESSING, bar tracks links handed to the indexer (1/1), not crawl results.
  const handedOff = task.urls.filter((u) => statusBucket(u.status) !== "pending").length;
  const pipelineCount = task.externalId && handedOff === 0 ? total : handedOff;
  const percent = taskComplete ? 100 : total ? Math.round((pipelineCount / total) * 100) : 0;
  const linksDone = taskComplete ? crawled : task.externalId ? total : pipelineCount;

  return {
    total,
    crawled,
    success: linksDone,
    partial: pipelineCount,
    percent,
    taskComplete,
  };
}

export function getTaskRowStatus(task: SerializedTask): TaskRowStatus {
  const { total, success } = getTaskProgress(task);
  const hasFailed = task.urls.some((u) => statusBucket(u.status) === "failed");
  const allDone = task.urls.every((u) => isTerminalStatus(u.status));

  if (success === total && total > 0) return "completed";
  if (hasFailed && allDone) return "failed";
  return "processing";
}

export function getTaskDisplayStatus(task: SerializedTask): string {
  return getTaskListStatus(task);
}

export function taskHasInProgress(task: SerializedTask) {
  if (!task.externalId) return false;
  return !isProviderTaskComplete(task);
}

export function getStatusLabel(rowStatus: TaskRowStatus) {
  if (rowStatus === "completed") return "COMPLETED";
  if (rowStatus === "failed") return "FAILED";
  return "DELAYED";
}

export function getFailedUrls(task: SerializedTask) {
  return task.urls.filter((u) => statusBucket(u.status) === "failed").map((u) => u.url);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function getTierLabel(tier: string) {
  return tier === "instant" ? "Instant" : "Standard";
}

export function filterTasksByTab(tasks: SerializedTask[], tab: TaskTab) {
  if (tab === "all") return tasks;
  if (tab === "processing") {
    return tasks.filter((t) => !isProviderTaskComplete(t) && getTaskRowStatus(t) !== "failed");
  }
  if (tab === "failed") {
    return tasks.filter((t) => getTaskRowStatus(t) === "failed");
  }
  return tasks.filter((t) => isProviderTaskComplete(t));
}

export function downloadTaskCsv(task: SerializedTask) {
  const header = "URL,Status,Date";
  const rows = task.urls.map((u) => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const date = u.indexedAt ?? task.createdAt;
    return [
      escape(u.url),
      escape(displayStatus(u.status)),
      escape(formatUrlDate(date)),
    ].join(",");
  });
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `task-${task.id.slice(-6)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
