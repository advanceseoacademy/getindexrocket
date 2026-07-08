"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchInput, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { computeReportStats, computeTaskUrlStats } from "@/lib/indexing-status";
import type { SerializedTask } from "@/lib/tasks-serialize";
import {
  formatTaskDate,
  formatTaskPublicId,
  formatUrlDate,
  getTaskDisplayBadge,
  isProviderTaskComplete,
} from "@/lib/task-ui";

type TaskDetailModalProps = {
  task: SerializedTask | null;
  onClose: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  refreshing?: boolean;
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg3)]/50 px-3 py-3 text-center sm:px-4">
      <p className="text-[10px] font-semibold tracking-wider text-[var(--muted2)] uppercase">{label}</p>
      <p className="stat-value mt-1 text-xl font-bold sm:text-2xl" style={{ color }}>
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
  const [urlSearch, setUrlSearch] = useState("");
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!task) return;
    setUrlSearch("");
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  const filteredUrls = useMemo(() => {
    if (!task) return [];
    const q = urlSearch.trim().toLowerCase();
    if (!q) return task.urls;
    return task.urls.filter((u) => u.url.toLowerCase().includes(q));
  }, [task, urlSearch]);

  if (!task) return null;

  const stats = computeTaskUrlStats(task.urls);
  const urlBreakdown = computeReportStats([{ urls: task.urls }]);
  const complete = isProviderTaskComplete(task);
  const badge = getTaskDisplayBadge(task);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-[var(--card-border)] bg-[var(--bg2)] shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        <div className="border-b border-[var(--card-border)] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted)]">Tasks / {formatTaskPublicId(task)}</p>
              <h2 id="task-detail-title" className="mt-1 text-lg font-bold sm:text-xl">
                {task.urlsCount} URL{task.urlsCount !== 1 ? "s" : ""}
              </h2>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${badge.processing ? "animate-pulse" : ""}`}
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.label}
            </span>
            {!complete && (
              <span className="text-xs text-[var(--muted)]">Updates automatically while processing</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 px-5 py-4 sm:grid-cols-4 sm:gap-3 sm:px-6">
          <StatCard label="Total" value={stats.total} color="var(--text)" />
          <StatCard label="Crawled" value={stats.crawled} color="var(--success)" />
          <StatCard label="Refunded" value={urlBreakdown.refunded} color="var(--amber)" />
          <StatCard label="In progress" value={urlBreakdown.inProgress} color="var(--blue)" />
        </div>

        <div className="flex flex-col gap-3 border-t border-b border-[var(--card-border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h3 className="font-semibold">URLs</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-48">
              <SearchInput value={urlSearch} onChange={setUrlSearch} placeholder="Filter URLs…" />
            </div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
              >
                {refreshing ? "Checking…" : "Re-check"}
              </button>
            )}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                CSV
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Mobile URL cards */}
          <div className="space-y-2 p-4 sm:hidden">
            {filteredUrls.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted)]">No URLs match your search</p>
            ) : (
              filteredUrls.map((url) => (
                <div
                  key={url.id}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3"
                >
                  <StatusBadge status={url.status} />
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-xs text-[var(--blue)] no-underline hover:underline"
                  >
                    {url.url}
                  </a>
                  <p className="mt-1 text-[10px] text-[var(--muted2)]">
                    {formatUrlDate(url.indexedAt ?? task.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <table className="hidden w-full text-sm sm:table">
            <thead className="sticky top-0 bg-[var(--bg2)]">
              <tr className="text-left text-[11px] font-semibold tracking-wider text-[var(--muted2)] uppercase">
                <th className="px-6 py-3">URL</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUrls.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-[var(--muted)]">
                    No URLs match your search
                  </td>
                </tr>
              ) : (
                filteredUrls.map((url) => (
                  <tr key={url.id} className="border-t border-[var(--card-border)]">
                    <td className="max-w-[320px] px-6 py-3.5">
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-[var(--muted)] no-underline hover:text-[var(--text)]"
                      >
                        {url.url}
                      </a>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={url.status} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-[var(--muted2)]">
                      {formatUrlDate(url.indexedAt ?? task.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="border-t border-[var(--card-border)] px-5 py-3 text-xs text-[var(--muted2)] sm:px-6">
          Submitted {formatTaskDate(task.createdAt)}
          {filteredUrls.length !== task.urls.length && (
            <> · Showing {filteredUrls.length} of {task.urls.length} URLs</>
          )}
        </p>
      </div>
    </div>
  );
}
