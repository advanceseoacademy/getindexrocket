"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TaskDetailModal } from "@/components/dashboard/TaskDetailModal";
import {
  countTasksByTab,
  DashboardEmptyState,
  DashboardToast,
  FilterPills,
  SearchInput,
  TableSkeleton,
  TASK_TABS,
  URL_STATUS_FILTERS,
  useDashboardToast,
  filterTasksByUrlStatus,
  searchTasks,
  type UrlStatusFilter,
} from "@/components/dashboard/dashboard-ui";
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
import { fetchCached, invalidateCache, peekCached } from "@/lib/client-cache";

type ReportResponse = {
  tasks: SerializedTask[];
  stats: import("@/lib/indexing-status").ReportStats;
};

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

function TaskStatusBadge({ task }: { task: SerializedTask }) {
  const badge = getTaskDisplayBadge(task);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${badge.processing ? "animate-pulse" : ""}`}
      style={{ color: badge.color, background: badge.bg }}
    >
      {badge.label}
    </span>
  );
}

function UrlStatusBar({ stats }: { stats: ReturnType<typeof computeReportStats> }) {
  const items = [
    { label: "Crawled", value: stats.crawled, color: "var(--success)" },
    { label: "In progress", value: stats.inProgress, color: "var(--blue)" },
    { label: "Refunded", value: stats.refunded, color: "var(--amber)" },
    { label: "Failed", value: stats.failed, color: "#f87171" },
  ];
  const total = stats.totalUrls || 1;

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--bg3)]">
        {items.map((item) =>
          item.value > 0 ? (
            <div
              key={item.label}
              className="h-full transition-all"
              style={{ width: `${(item.value / total) * 100}%`, background: item.color }}
              title={`${item.label}: ${item.value}`}
            />
          ) : null,
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span className="font-medium text-[var(--text)] tabular-nums">{item.value}</span>
            {item.label}
          </span>
        ))}
        <span className="ml-auto text-[var(--muted2)]">
          {stats.successRate}% success · {stats.totalUrls} URLs
        </span>
      </div>
    </div>
  );
}

function TaskProgressBar({ task }: { task: SerializedTask }) {
  const progress = getTaskProgress(task);
  const rowStatus = getTaskRowStatus(task);
  const isComplete = progress.taskComplete;

  return (
    <div className="space-y-1.5">
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg3)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress.percent}%`,
            background: isComplete
              ? "var(--success)"
              : rowStatus === "failed"
                ? "var(--amber)"
                : "linear-gradient(90deg, var(--blue), var(--accent))",
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[var(--muted)]">
          {isComplete
            ? "Complete"
            : rowStatus === "failed"
              ? "Completed with errors"
              : "Processing…"}
        </span>
        <span className="font-medium tabular-nums text-[var(--muted2)]">
          {progress.crawled}/{progress.total} crawled
        </span>
      </div>
    </div>
  );
}

function TaskActions({
  task,
  onView,
  onRefresh,
  onExport,
  refreshing,
  compact,
}: {
  task: SerializedTask;
  onView: () => void;
  onRefresh: () => void;
  onExport: () => void;
  refreshing: boolean;
  compact?: boolean;
}) {
  const btnClass = compact
    ? "rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
    : undefined;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onView} className={btnClass}>
          Details
        </button>
        <button type="button" onClick={onRefresh} disabled={refreshing} className={btnClass}>
          {refreshing ? "Syncing…" : "Sync"}
        </button>
        <button type="button" onClick={onExport} className={btnClass}>
          CSV
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <IconButton label="View details" onClick={onView}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </IconButton>
      <IconButton label="Sync status" onClick={onRefresh} disabled={refreshing}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      </IconButton>
      <IconButton label="Download CSV" onClick={onExport}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </IconButton>
    </div>
  );
}

function TaskMobileCard({
  task,
  onView,
  onRefresh,
  onExport,
  refreshing,
}: {
  task: SerializedTask;
  onView: () => void;
  onRefresh: () => void;
  onExport: () => void;
  refreshing: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--bg3)] text-sm font-bold text-[var(--blue)]">
          {getTaskIconLetter(task)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold">{getTaskTitle(task)}</p>
            <TaskStatusBadge task={task} />
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted2)]">
            {formatTaskPublicId(task)} · {formatTaskDate(task.createdAt)}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <TaskProgressBar task={task} />
      </div>
      <div className="mt-4">
        <TaskActions
          task={task}
          onView={onView}
          onRefresh={onRefresh}
          onExport={onExport}
          refreshing={refreshing}
          compact
        />
      </div>
    </article>
  );
}

const TASKS_FAST = "/api/tasks?skipSync=1";

export function IndexingReport() {
  const [tasks, setTasks] = useState<SerializedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TaskTab>("all");
  const [statusFilter, setStatusFilter] = useState<UrlStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingTask, setRefreshingTask] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<SerializedTask | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [pageActive, setPageActive] = useState(
    () => typeof window !== "undefined" && window.location.pathname === "/tasks",
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { message, variant, show: showToast } = useDashboardToast();

  const loadTasks = useCallback(async (withSync = false) => {
    const url = withSync ? "/api/tasks" : TASKS_FAST;
    if (withSync) invalidateCache(TASKS_FAST);
    try {
      const data = withSync
        ? await fetch(url, { credentials: "same-origin" }).then((res) => {
            if (!res.ok) throw new Error("fetch failed");
            return res.json() as Promise<ReportResponse>;
          })
        : await fetchCached<ReportResponse>(url, 30_000);
      if (data?.tasks) {
        setTasks(data.tasks);
        if (withSync) setLastSyncedAt(new Date());
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = peekCached<ReportResponse>(TASKS_FAST);
    if (cached?.tasks) {
      setTasks(cached.tasks);
      setLoading(false);
    }
    void loadTasks(false);
    const syncTimer = window.setTimeout(() => void loadTasks(true), 1200);
    return () => clearTimeout(syncTimer);
  }, [loadTasks]);

  useEffect(() => {
    const onNav = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      const active = path === "/tasks";
      setPageActive(active);
    };
    window.addEventListener("gir:dashboard-nav", onNav);
    return () => window.removeEventListener("gir:dashboard-nav", onNav);
  }, []);

  const reportStats = useMemo(() => computeReportStats(tasks), [tasks]);
  const tabCounts = useMemo(() => countTasksByTab(tasks), [tasks]);

  const statusCounts = useMemo(
    () => ({
      all: tasks.length,
      crawled: filterTasksByUrlStatus(tasks, "crawled").length,
      processing: filterTasksByUrlStatus(tasks, "processing").length,
      refunded: filterTasksByUrlStatus(tasks, "refunded").length,
      failed: filterTasksByUrlStatus(tasks, "failed").length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    let list = filterTasksByTab(tasks, tab);
    list = filterTasksByUrlStatus(list, statusFilter);
    list = searchTasks(list, search);
    return list;
  }, [tasks, tab, statusFilter, search]);

  const hasInProgress = useMemo(() => tasks.some((t) => taskHasInProgress(t)), [tasks]);
  const hasFilters = search.trim() !== "" || tab !== "all" || statusFilter !== "all";

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks(true);
      showToast("Tasks synced successfully", "success");
    } catch {
      showToast("Sync failed — try again", "error");
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks, showToast]);

  const refreshTask = useCallback(
    async (taskId: string) => {
      setRefreshingTask(taskId);
      try {
        const res = await fetch(`/api/tasks/${taskId}/refresh`, { method: "POST" });
        const data = await res.json();
        if (res.ok && data.task) {
          setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
          if (detailTask?.id === taskId) setDetailTask(data.task);
          invalidateCache("/api/tasks");
          showToast("Task status updated", "success");
        } else {
          showToast("Could not refresh task", "error");
        }
      } finally {
        setRefreshingTask(null);
      }
    },
    [detailTask?.id, showToast],
  );

  useEffect(() => {
    if (!autoSync || !hasInProgress || !pageActive) return;

    const tick = () => {
      if (document.visibilityState === "visible") void loadTasks(true);
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
          <h1 className="text-2xl font-bold md:text-3xl">My Tasks</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Monitor indexing campaigns and URL-level crawl status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="accent-[var(--blue)]"
            />
            Auto-sync{hasInProgress && pageActive ? " · 10s" : ""}
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
            onClick={() => navigateDashboard("/dashboard")}
            className="btn btn-primary btn-md"
          >
            + New task
          </button>
        </div>
      </div>

      {!loading && tasks.length > 0 && <UrlStatusBar stats={reportStats} />}

      <div className="space-y-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills items={TASK_TABS} value={tab} onChange={setTab} counts={tabCounts} />
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <FilterPills
          items={URL_STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : tasks.length === 0 ? (
        <DashboardEmptyState
          title="No indexing tasks yet"
          description="Submit your first guest post, niche edit, or backlink URL to start tracking crawl status."
          actionLabel="Submit URLs"
          onAction={() => navigateDashboard("/dashboard")}
          icon="🚀"
        />
      ) : filtered.length === 0 ? (
        <DashboardEmptyState
          title="No tasks match your filters"
          description="Try clearing search or switching tabs to see more results."
          actionLabel={hasFilters ? "Clear filters" : undefined}
          onAction={
            hasFilters
              ? () => {
                  setSearch("");
                  setTab("all");
                  setStatusFilter("all");
                }
              : undefined
          }
          icon="🔍"
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((task) => (
              <TaskMobileCard
                key={task.id}
                task={task}
                onView={() => setDetailTask(task)}
                onRefresh={() => refreshTask(task.id)}
                onExport={() => {
                  downloadTaskCsv(task);
                  showToast("CSV downloaded", "success");
                }}
                refreshing={refreshingTask === task.id}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-left text-[11px] font-semibold tracking-wider text-[var(--muted2)] uppercase">
                    <th className="px-5 py-4">Task</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="min-w-[200px] px-5 py-4">Progress</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((task) => (
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
                        <TaskProgressBar task={task} />
                      </td>
                      <td className="px-5 py-4">
                        <TaskActions
                          task={task}
                          onView={() => setDetailTask(task)}
                          onRefresh={() => refreshTask(task.id)}
                          onExport={() => {
                            downloadTaskCsv(task);
                            showToast("CSV downloaded", "success");
                          }}
                          refreshing={refreshingTask === task.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted2)]">
        <span>
          Showing {filtered.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          {lastSyncedAt && (
            <>
              {" "}
              · Synced{" "}
              {lastSyncedAt.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
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
        onRefresh={detailTask ? () => refreshTask(detailTask.id) : undefined}
        onExport={
          detailTask
            ? () => {
                downloadTaskCsv(detailTask);
                showToast("CSV downloaded", "success");
              }
            : undefined
        }
        refreshing={detailTask ? refreshingTask === detailTask.id : false}
      />

      <DashboardToast message={message} variant={variant} />
    </div>
  );
}
