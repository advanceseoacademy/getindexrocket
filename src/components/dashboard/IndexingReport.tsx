"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TaskDetailModal } from "@/components/dashboard/TaskDetailModal";
import { navigateDashboard } from "@/lib/dashboard-nav";
import { computeReportStats } from "@/lib/indexing-status";
import type { SerializedTask } from "@/lib/tasks-serialize";
import {
  filterTasksByTab,
  formatTaskDate,
  formatTaskPublicId,
  getTaskDisplayBadge,
  getTaskIconLetter,
  getTaskProgress,
  getTaskRowStatus,
  getTaskTitle,
  downloadTaskCsv,
  taskHasInProgress,
  type TaskTab,
} from "@/lib/task-ui";
import { invalidateCache } from "@/lib/client-cache";

type ReportResponse = {
  tasks: SerializedTask[];
  stats: import("@/lib/indexing-status").ReportStats;
};

const TABS: { id: TaskTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
];

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--bg3)] text-[var(--muted)] transition hover:border-[var(--muted2)] hover:text-[var(--text)] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function TaskStatusBadge({ task }: { task: SerializedTask }) {
  const badge = getTaskDisplayBadge(task);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide"
      style={{ color: badge.color, background: badge.bg }}
    >
      {badge.processing && <SearchIcon />}
      {badge.label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 border-b border-[var(--card-border)] bg-[var(--bg3)]/40" />
      ))}
    </div>
  );
}

export function IndexingReport() {
  const [tasks, setTasks] = useState<SerializedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TaskTab>("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingTask, setRefreshingTask] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<SerializedTask | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [pageActive, setPageActive] = useState(
    () => typeof window !== "undefined" && window.location.pathname === "/tasks",
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const loadTasks = useCallback(async (skipCache = false) => {
    const url = skipCache ? "/api/tasks" : "/api/tasks?skipSync=1";
    if (skipCache) invalidateCache("/api/tasks");
    try {
      const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ReportResponse;
      if (data?.tasks) {
        setTasks(data.tasks);
        if (skipCache) setLastSyncedAt(new Date());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks(true);
  }, [loadTasks]);

  useEffect(() => {
    const onNav = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      const active = path === "/tasks";
      setPageActive(active);
      if (active) void loadTasks(true);
    };
    window.addEventListener("gir:dashboard-nav", onNav);
    return () => window.removeEventListener("gir:dashboard-nav", onNav);
  }, [loadTasks]);

  const filtered = useMemo(() => {
    let list = filterTasksByTab(tasks, tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.urls.some((u) => u.url.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [tasks, tab, search]);

  const hasInProgress = useMemo(
    () => tasks.some((t) => taskHasInProgress(t)),
    [tasks],
  );

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks]);

  const refreshTask = useCallback(async (taskId: string) => {
    setRefreshingTask(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/refresh`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        if (detailTask?.id === taskId) setDetailTask(data.task);
        invalidateCache("/api/tasks");
      }
    } finally {
      setRefreshingTask(null);
    }
  }, [detailTask?.id]);

  useEffect(() => {
    if (!autoSync || !hasInProgress || !pageActive) return;

    const tick = () => {
      if (document.visibilityState === "visible") {
        void loadTasks(true);
      }
    };

    tick();
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, [autoSync, hasInProgress, pageActive, loadTasks]);

  useEffect(() => {
    setDetailTask((current) => {
      if (!current) return current;
      return tasks.find((t) => t.id === current.id) ?? current;
    });
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage and monitor your indexing campaigns
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="accent-[var(--blue)]"
            />
            Auto-sync {hasInProgress && pageActive ? "(every 10s)" : ""}
          </label>
          <button
            type="button"
            onClick={() => refreshAll()}
            disabled={refreshing}
            className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
          >
            {refreshing ? "Syncing…" : "Sync all"}
          </button>
          <button
            type="button"
            onClick={() => navigateDashboard("/submit")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--blue)] px-4 py-2 text-sm font-semibold text-white"
          >
            <span className="text-lg leading-none">+</span> New
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-[var(--blue)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks or URLs…"
          className="w-full max-w-xs rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2 text-sm outline-none focus:border-[var(--blue)]"
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-6 py-16 text-center">
          <p className="text-[var(--muted)]">No tasks found.</p>
          <button
            type="button"
            onClick={() => navigateDashboard("/submit")}
            className="mt-4 rounded-lg bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Submit your first URLs
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left text-[11px] font-semibold tracking-wider text-[var(--muted2)] uppercase">
                  <th className="px-5 py-4">Task details</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="min-w-[200px] px-5 py-4">Progress</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const progress = getTaskProgress(task);
                  const rowStatus = getTaskRowStatus(task);
                  const isComplete = progress.taskComplete;
                  const processing = !isComplete;

                  return (
                    <tr
                      key={task.id}
                      className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--bg3)]/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] text-sm font-bold text-[var(--blue)]">
                            {getTaskIconLetter(task)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{getTaskTitle(task)}</p>
                            <p className="mt-0.5 text-xs text-[var(--muted2)]">
                              {formatTaskPublicId(task)} · {formatTaskDate(task.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TaskStatusBadge task={task} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg3)]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress.percent}%`,
                                background: isComplete
                                  ? "var(--green)"
                                  : processing
                                    ? "linear-gradient(90deg, var(--blue), var(--green))"
                                    : "var(--blue)",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-[var(--muted)]">
                              {isComplete
                                ? "100% Complete"
                                : rowStatus === "failed"
                                  ? "Completed with errors"
                                  : "Processing…"}
                            </span>
                            <span className="font-medium text-[var(--muted2)]">
                              {progress.success}/{progress.total} Links
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton label="View details" onClick={() => setDetailTask(task)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </IconButton>
                          <IconButton
                            label="Sync status"
                            onClick={() => refreshTask(task.id)}
                            disabled={refreshingTask === task.id}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.3-4.3" />
                            </svg>
                          </IconButton>
                          <IconButton label="Download CSV" onClick={() => downloadTaskCsv(task)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted2)]">
        <span>
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          {tasks.length > 0 && ` · ${computeReportStats(tasks).successRate}% success rate`}
          {lastSyncedAt && (
            <>
              {" "}
              · Updated {lastSyncedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </>
          )}
        </span>
        <a href="/api/tasks/export" className="text-[var(--blue)] no-underline hover:underline">
          Export all CSV
        </a>
      </div>

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onRefresh={
          detailTask
            ? () => refreshTask(detailTask.id)
            : undefined
        }
        onExport={detailTask ? () => downloadTaskCsv(detailTask) : undefined}
        refreshing={detailTask ? refreshingTask === detailTask.id : false}
      />
    </div>
  );
}
