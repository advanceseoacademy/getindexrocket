"use client";

import { useEffect, useState } from "react";
import { fetchCached } from "@/lib/client-cache";

type TaskUrl = {
  id: string;
  url: string;
  status: string;
  indexedAt: string | null;
};

type Task = {
  id: string;
  externalId: string | null;
  tier: string;
  status: string;
  urlsCount: number;
  creditsCharged: number;
  createdAt: string;
  urls: TaskUrl[];
};

const STATUS_COLORS: Record<string, string> = {
  indexed: "text-[var(--success)]",
  pending: "text-[var(--amber)]",
  processing: "text-[var(--blue)]",
  refunded: "text-[var(--muted)]",
  failed: "text-red-400",
};

function serializeTask(task: {
  id: string;
  externalId: string | null;
  tier: string;
  status: string;
  urlsCount: number;
  creditsCharged: number;
  createdAt: string | Date;
  urls: Array<{
    id: string;
    url: string;
    status: string;
    indexedAt: string | Date | null;
  }>;
}): Task {
  return {
    id: task.id,
    externalId: task.externalId,
    tier: task.tier,
    status: task.status,
    urlsCount: task.urlsCount,
    creditsCharged: task.creditsCharged,
    createdAt:
      typeof task.createdAt === "string" ? task.createdAt : task.createdAt.toISOString(),
    urls: task.urls.map((u) => ({
      id: u.id,
      url: u.url,
      status: u.status,
      indexedAt: u.indexedAt
        ? typeof u.indexedAt === "string"
          ? u.indexedAt
          : u.indexedAt.toISOString()
        : null,
    })),
  };
}

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-2xl bg-[var(--bg3)]" />
      ))}
    </div>
  );
}

export function TaskList({ initialTasks }: { initialTasks?: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks ?? []);
  const [loading, setLoading] = useState(!initialTasks);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    if (initialTasks) return;

    fetchCached<{ tasks: Parameters<typeof serializeTask>[0][] }>("/api/tasks")
      .then((data) => {
        if (data?.tasks) {
          setTasks(data.tasks.map(serializeTask));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialTasks]);

  async function refreshTask(taskId: string) {
    setRefreshing(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/refresh`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? serializeTask(data.task) : t)),
        );
      }
    } finally {
      setRefreshing(null);
    }
  }

  if (loading) return <ListSkeleton />;

  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        No submissions yet. Submit your first URL to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                {task.urlsCount} URL(s) · {task.creditsCharged} credits used
              </p>
              <p className="text-xs text-[var(--muted2)]">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${STATUS_COLORS[task.status] ?? "text-[var(--muted)]"}`}
              >
                {task.status}
              </span>
              <button
                type="button"
                onClick={() => refreshTask(task.id)}
                disabled={refreshing === task.id}
                className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
              >
                {refreshing === task.id ? "..." : "Refresh"}
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {task.urls.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-[var(--muted)]">{u.url}</span>
                <span className={`shrink-0 ${STATUS_COLORS[u.status] ?? "text-[var(--muted)]"}`}>
                  {u.status}
                </span>
              </div>
            ))}
            {task.urls.length > 5 && (
              <p className="text-xs text-[var(--muted2)]">+{task.urls.length - 5} more URLs</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
