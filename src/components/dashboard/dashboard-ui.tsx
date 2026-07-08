"use client";

import { useCallback, useState, type ReactNode } from "react";
import { getStatusStyle, statusBucket } from "@/lib/indexing-status";
import type { SerializedTask } from "@/lib/tasks-serialize";
import { filterTasksByTab, type TaskTab } from "@/lib/task-ui";

export type UrlStatusFilter = "all" | "crawled" | "processing" | "refunded" | "failed";

export function searchTasks(tasks: SerializedTask[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.id.toLowerCase().includes(q) ||
      (t.providerTaskId && String(t.providerTaskId).includes(q)) ||
      t.urls.some((u) => u.url.toLowerCase().includes(q)),
  );
}

export function filterTasksByUrlStatus(tasks: SerializedTask[], status: UrlStatusFilter) {
  if (status === "all") return tasks;
  return tasks.filter((t) =>
    t.urls.some((u) => {
      const b = statusBucket(u.status);
      if (status === "processing") {
        return ["processing", "pending", "submitted", "discovered"].includes(b);
      }
      return b === status;
    }),
  );
}

export function countTasksByTab(tasks: SerializedTask[]) {
  return {
    all: tasks.length,
    processing: filterTasksByTab(tasks, "processing").length,
    completed: filterTasksByTab(tasks, "completed").length,
    failed: filterTasksByTab(tasks, "failed").length,
  };
}

export function useDashboardToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"success" | "info" | "error">("info");

  const show = useCallback((msg: string, v: "success" | "info" | "error" = "info") => {
    setMessage(msg);
    setVariant(v);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);

  return { message, variant, show };
}

export function DashboardToast({
  message,
  variant = "info",
}: {
  message: string | null;
  variant?: "success" | "info" | "error";
}) {
  if (!message) return null;

  const styles = {
    success: "border-[var(--success)]/30 bg-[var(--blue-10)] text-[var(--success)]",
    info: "border-[var(--blue-30)] bg-[var(--blue-08)] text-[var(--blue)]",
    error: "border-red-400/30 bg-red-400/10 text-red-300",
  };

  return (
    <div
      className={`fixed bottom-6 right-4 z-[120] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${styles[variant]} animate-page-in`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {message}
    </div>
  );
}

export function DashboardStatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="dash-stat-card hover-lift rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
          <p
            className="stat-value mt-2 text-2xl font-bold tracking-tight"
            style={accent ? { color: accent } : undefined}
          >
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-[var(--muted2)]">{sub}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--blue-10)] text-[var(--blue)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status, pulse }: { status: string; pulse?: boolean }) {
  const style = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${pulse ? "animate-pulse" : ""}`}
      style={{ color: style.color, background: style.bg }}
    >
      {style.label}
    </span>
  );
}

export function FilterPills<T extends string>({
  items,
  value,
  onChange,
  counts,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter">
      {items.map((item) => {
        const active = value === item.id;
        const count = counts?.[item.id];
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              active
                ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                : "border-[var(--card-border)] bg-[var(--bg2)] text-[var(--muted)] hover:border-[var(--muted2)] hover:text-[var(--text)]"
            }`}
          >
            {item.label}
            {count !== undefined ? ` (${count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

export function DashboardEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  compact,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] text-center ${
        compact ? "px-4 py-8" : "px-6 py-14"
      }`}
    >
      {icon && (
        <div
          className={`mx-auto flex items-center justify-center rounded-2xl bg-[var(--blue-10)] text-[var(--blue)] ${
            compact ? "mb-3 h-10 w-10 text-lg" : "mb-4 h-14 w-14 text-2xl"
          }`}
        >
          {icon}
        </div>
      )}
      <h3 className={compact ? "text-sm font-semibold" : "text-lg font-semibold"}>{title}</h3>
      <p className={`mx-auto max-w-md text-[var(--muted)] ${compact ? "mt-1 text-xs" : "mt-2 text-sm"}`}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className={`btn btn-primary ${compact ? "btn-sm" : "btn-md"} mt-4`}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="dash-skeleton overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[4.5rem] border-b border-[var(--card-border)] last:border-0">
          <div className="flex h-full items-center gap-4 px-5">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--bg3)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-[var(--bg3)]" />
              <div className="h-2 w-1/4 rounded bg-[var(--bg3)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const TAB_ITEMS: { id: TaskTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export const TASK_TABS = TAB_ITEMS;

export const URL_STATUS_FILTERS: { id: UrlStatusFilter; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "crawled", label: "Crawled" },
  { id: "processing", label: "In progress" },
  { id: "refunded", label: "Refunded" },
  { id: "failed", label: "Failed" },
];

export function SearchInput({
  value,
  onChange,
  placeholder = "Search tasks or URLs…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-18)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)]"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
