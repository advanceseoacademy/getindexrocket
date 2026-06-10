"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RecentTaskCard } from "@/components/dashboard/RecentTaskCard";
import { invalidateCache } from "@/lib/client-cache";
import { navigateDashboard } from "@/lib/dashboard-nav";
import type { SerializedTask } from "@/lib/tasks-serialize";
import { filterTasksByTab, taskHasInProgress, type TaskTab } from "@/lib/task-ui";

type DashboardRecentTasksProps = {
  tasks: SerializedTask[];
  onTasksChange?: () => void;
};

const TABS: { id: TaskTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export function DashboardRecentTasks({ tasks, onTasksChange }: DashboardRecentTasksProps) {
  const [tab, setTab] = useState<TaskTab>("all");
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      processing: filterTasksByTab(tasks, "processing").length,
      completed: filterTasksByTab(tasks, "completed").length,
      failed: filterTasksByTab(tasks, "failed").length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => filterTasksByTab(tasks, tab).slice(0, 6), [tasks, tab]);

  const hasInProgress = useMemo(() => tasks.some((t) => taskHasInProgress(t)), [tasks]);

  useEffect(() => {
    if (!hasInProgress || !onTasksChange) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") onTasksChange();
    }, 15_000);
    return () => clearInterval(interval);
  }, [hasInProgress, onTasksChange]);

  const refreshTask = useCallback(
    async (taskId: string) => {
      setRefreshingId(taskId);
      try {
        await fetch(`/api/tasks/${taskId}/refresh`, { method: "POST", credentials: "same-origin" });
        invalidateCache("/api/dashboard");
        invalidateCache("/api/tasks");
        onTasksChange?.();
      } finally {
        setRefreshingId(null);
      }
    },
    [onTasksChange],
  );

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Recent tasks</h2>
        <button
          type="button"
          onClick={() => navigateDashboard("/tasks")}
          className="text-xs text-[var(--blue)] hover:underline"
        >
          View all
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-2.5 py-1 text-xs ${
              tab === t.id
                ? "bg-[var(--bg4)] font-medium text-[var(--text)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">No tasks yet</p>
        ) : (
          filtered.map((task) => (
            <RecentTaskCard
              key={task.id}
              task={task}
              onRefresh={refreshTask}
              refreshing={refreshingId === task.id}
            />
          ))
        )}
      </div>

      {tasks.length > 6 && (
        <button
          type="button"
          onClick={() => navigateDashboard("/tasks")}
          className="mt-4 w-full rounded-lg border border-[var(--card-border)] py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          See more
        </button>
      )}
    </div>
  );
}
