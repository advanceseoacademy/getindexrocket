/**
 * IndexNowFast status alignment.
 *
 * Their API often returns `indexed` in JSON, but the dashboard UI labels
 * successful crawl verification as **CRAWLED**. We mirror the dashboard.
 */

export type StatusBucket =
  | "crawled"
  | "pending"
  | "processing"
  | "failed"
  | "refunded"
  | "submitted"
  | "discovered";

export const FILTER_TABS: { id: "all" | StatusBucket; label: string }[] = [
  { id: "all", label: "All" },
  { id: "crawled", label: "Crawled" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

type StatusStyle = { label: string; color: string; bg: string };

const BUCKET_META: Record<StatusBucket, StatusStyle> = {
  crawled: { label: "CRAWLED", color: "var(--green)", bg: "rgba(34,211,122,0.14)" },
  discovered: { label: "DISCOVERED", color: "var(--blue)", bg: "rgba(59,143,255,0.14)" },
  submitted: { label: "SUBMITTED", color: "var(--blue)", bg: "rgba(59,143,255,0.1)" },
  processing: { label: "PROCESSING", color: "var(--blue)", bg: "rgba(59,143,255,0.12)" },
  pending: { label: "PENDING", color: "var(--muted)", bg: "rgba(255,255,255,0.06)" },
  refunded: { label: "REFUNDED", color: "var(--amber)", bg: "rgba(245,166,35,0.14)" },
  failed: { label: "FAILED", color: "#f87171", bg: "rgba(248,113,113,0.14)" },
};

/** Normalize IndexNowFast API status → stored/display bucket. */
export function normalizeApiStatus(raw: string): string {
  const s = raw.toLowerCase().replace(/\s+/g, "_").trim();
  if (!s) return "pending";

  // Provider API task.status "completed" = done (shown as CRAWLED in their dashboard)
  if (["completed", "complete"].includes(s)) return "crawled";
  if (["indexed", "index", "crawled", "crawl", "done", "success"].includes(s)) {
    return "crawled";
  }
  if (["discovered", "found"].includes(s)) return "discovered";
  if (["submitted", "submit", "queued"].includes(s)) return "submitted";
  if (["processing", "in_progress", "running", "active"].includes(s)) return "processing";
  if (["refunded", "refund"].includes(s)) return "refunded";
  if (["failed", "error", "fail", "rejected"].includes(s)) return "failed";
  if (["pending", "waiting"].includes(s)) return "pending";

  return s;
}

export function statusBucket(raw: string): StatusBucket {
  const normalized = normalizeApiStatus(raw);
  if (normalized in BUCKET_META) return normalized as StatusBucket;
  return "pending";
}

export function displayStatus(raw: string): string {
  return getStatusStyle(raw).label;
}

export function getStatusStyle(raw: string): StatusStyle {
  const bucket = statusBucket(raw);
  return BUCKET_META[bucket];
}

/** @deprecated */
export function normalizeStatus(raw: string): StatusBucket {
  return statusBucket(raw);
}

export const STATUS_META = BUCKET_META;

export function isTerminalStatus(raw: string) {
  const b = statusBucket(raw);
  return b === "crawled" || b === "refunded" || b === "failed";
}

export function isSuccessStatus(raw: string) {
  return statusBucket(raw) === "crawled";
}

export type ReportUrl = { status: string };
export type ReportTask = { urls: ReportUrl[] };

export type ReportStats = {
  totalUrls: number;
  totalTasks: number;
  crawled: number;
  discovered: number;
  submitted: number;
  processing: number;
  pending: number;
  refunded: number;
  failed: number;
  successRate: number;
  inProgress: number;
};

export function computeReportStats(tasks: ReportTask[]): ReportStats {
  const counts = {
    crawled: 0,
    discovered: 0,
    submitted: 0,
    processing: 0,
    pending: 0,
    refunded: 0,
    failed: 0,
  };

  let totalUrls = 0;
  for (const task of tasks) {
    for (const url of task.urls) {
      totalUrls++;
      const key = statusBucket(url.status);
      counts[key]++;
    }
  }

  const inProgress =
    counts.discovered + counts.submitted + counts.processing + counts.pending;
  const successRate = totalUrls
    ? Math.round((counts.crawled / totalUrls) * 1000) / 10
    : 0;

  return {
    totalUrls,
    totalTasks: tasks.length,
    ...counts,
    successRate,
    inProgress,
  };
}

export function computeTaskUrlStats(urls: ReportUrl[]) {
  const stats = computeReportStats([{ urls }]);
  return {
    total: stats.totalUrls,
    crawled: stats.crawled,
    failed: stats.failed,
    pending: stats.pending + stats.processing + stats.submitted + stats.discovered,
  };
}
