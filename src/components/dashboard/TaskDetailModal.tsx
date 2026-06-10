"use client";

import { computeTaskUrlStats } from "@/lib/indexing-status";
import type { SerializedTask } from "@/lib/tasks-serialize";
import {
  formatTaskDate,
  formatTaskPublicId,
  formatUrlDate,
  getTaskDisplayBadge,
  getUrlDisplayBadge,
  isProviderTaskComplete,
} from "@/lib/task-ui";

type TaskDetailModalProps = {
  task: SerializedTask | null;
  onClose: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  refreshing?: boolean;
};

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function TaskHeaderBadge({ task, refreshing }: { task: SerializedTask; refreshing?: boolean }) {
  const badge = getTaskDisplayBadge(task);
  const processing = badge.processing;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wide"
      style={{ color: badge.color, background: badge.bg }}
    >
      {processing && (
        <span className={refreshing ? "animate-pulse" : undefined}>
          <SearchIcon />
        </span>
      )}
      {badge.label}
    </span>
  );
}

function LinkStatusBadge({ url }: { url: SerializedTask["urls"][number] }) {
  const badge = getUrlDisplayBadge(url);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
      style={{ color: badge.color, background: badge.bg }}
    >
      {badge.processing && <SearchIcon />}
      {badge.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg3)]/50 px-4 py-3 text-center">
      <p className="text-[10px] font-semibold tracking-wider text-[var(--muted2)] uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export function TaskDetailModal({
  task,
  onClose,
  onRefresh,
  onExport,
  refreshing,
}: TaskDetailModalProps) {
  if (!task) return null;

  const stats = computeTaskUrlStats(task.urls);
  const complete = isProviderTaskComplete(task);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-[var(--card-border)] px-6 py-5">
          <p className="text-xs text-[var(--muted)]">
            Tasks / {formatTaskPublicId(task)}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{task.urlsCount} URLs</h2>
            <TaskHeaderBadge task={task} refreshing={refreshing} />
          </div>
          {!complete && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Indexing in progress — status updates automatically.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-4 sm:grid-cols-4">
          <StatCard label="Total links" value={stats.total} color="var(--text)" />
          <StatCard label="Crawled" value={stats.crawled} color="var(--success)" />
          <StatCard label="Failed" value={stats.failed} color="var(--amber)" />
          <StatCard label="Pending" value={stats.pending} color="var(--muted)" />
        </div>

        <div className="flex items-center justify-between border-t border-b border-[var(--card-border)] px-6 py-3">
          <h3 className="font-semibold">Links</h3>
          <div className="flex gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
              >
                {refreshing ? "Checking…" : "Re-check status"}
              </button>
            )}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                Export CSV
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[45vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--bg2)]">
              <tr className="text-left text-[11px] font-semibold tracking-wider text-[var(--muted2)] uppercase">
                <th className="px-6 py-3">URL</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {task.urls.map((url) => (
                <tr key={url.id} className="border-t border-[var(--card-border)]">
                  <td className="max-w-[320px] truncate px-6 py-3.5 text-[var(--muted)]">
                    <a
                      href={url.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:text-[var(--text)]"
                    >
                      {url.url}
                    </a>
                  </td>
                  <td className="px-6 py-3.5">
                    <LinkStatusBadge url={url} />
                  </td>
                  <td className="px-6 py-3.5 text-xs text-[var(--muted2)]">
                    {formatUrlDate(url.indexedAt ?? task.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="border-t border-[var(--card-border)] px-6 py-3 text-xs text-[var(--muted2)]">
          Submitted {formatTaskDate(task.createdAt)} · Status synced automatically
        </p>
      </div>
    </div>
  );
}
