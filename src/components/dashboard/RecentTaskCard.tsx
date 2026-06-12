"use client";

import { useState } from "react";
import { displayStatus, getStatusStyle } from "@/lib/indexing-status";
import { navigateDashboard } from "@/lib/dashboard-nav";
import type { SerializedTask } from "@/lib/tasks-serialize";
import {
  copyText,
  downloadTaskCsv,
  formatTimeAgo,
  getFailedUrls,
  getStatusLabel,
  getTaskProgress,
  getTaskRowStatus,
  getTaskTitle,
  getTierLabel,
} from "@/lib/task-ui";

type RecentTaskCardProps = {
  task: SerializedTask;
  defaultExpanded?: boolean;
  onRefresh?: (taskId: string) => Promise<void>;
  refreshing?: boolean;
};

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--blue-25)] bg-[var(--blue-10)] px-3 py-1.5 text-xs font-medium text-[var(--blue)] transition hover:bg-[var(--blue-18)] disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}

const icons = {
  retry: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  rocket: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    </svg>
  ),
  csv: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  open: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  pin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  globe: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

export function RecentTaskCard({
  task,
  defaultExpanded = false,
  onRefresh,
  refreshing = false,
}: RecentTaskCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [toast, setToast] = useState("");

  const title = getTaskTitle(task);
  const rowStatus = getTaskRowStatus(task);
  const statusLabel = getStatusLabel(rowStatus);
  const progress = getTaskProgress(task);
  const failedUrls = getFailedUrls(task);
  const headerStyle =
    rowStatus === "completed"
      ? { color: "var(--success)", bg: "var(--blue-14)" }
      : rowStatus === "failed"
        ? { color: "#f87171", bg: "rgba(248,113,113,0.14)" }
        : { color: "var(--blue)", bg: "var(--blue-14)" };

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2000);
  }

  async function handleCopyFailed() {
    if (!failedUrls.length) {
      flash("No failed URLs");
      return;
    }
    await copyText(failedUrls.join("\n"));
    flash("Failed URLs copied");
  }

  function handleResubmitAll() {
    const all = task.urls.map((u) => u.url).join("\n");
    sessionStorage.setItem("gir_resubmit_urls", all);
    navigateDashboard("/dashboard");
  }

  function handleOpen() {
    const url = task.urls[0]?.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--blue-18)] bg-[var(--blue-06)]">
      <div className="flex items-start gap-2 p-4">
        <div className="mt-0.5 shrink-0 text-[var(--blue)]">{icons.pin}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-[var(--text)]">{title}</span>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide"
              style={{ color: headerStyle.color, background: headerStyle.bg }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">{icons.globe} Indexer</span>
            <span>·</span>
            <span>{formatTimeAgo(task.createdAt)}</span>
          </div>
          <span className="mt-2 inline-block rounded-md border border-[var(--card-border)] bg-[var(--bg3)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
            {getTierLabel(task.tier)} · {task.creditsCharged} cr
          </span>
          <div className="mt-3">
            <div className="h-1 overflow-hidden rounded-full bg-[var(--bg4)]">
              <div
                className="h-full rounded-full bg-[var(--blue)] transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              {progress.taskComplete
                ? `${progress.crawled}/${progress.total} indexed`
                : `Processing… · ${progress.success}/${progress.total} links`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse task details" : "Expand task details"}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--bg3)] hover:text-[var(--text)]"
        >
          <span
            className={`text-xs transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▼
          </span>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[var(--blue-12)] px-4 pb-4">
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionBtn
              icon={icons.retry}
              label="Retry failed"
              disabled={refreshing || !failedUrls.length}
              onClick={() => onRefresh?.(task.id)}
            />
            <ActionBtn icon={icons.copy} label="Copy failed" onClick={handleCopyFailed} />
            <ActionBtn icon={icons.rocket} label="Re-submit all" onClick={handleResubmitAll} />
            <ActionBtn icon={icons.csv} label="CSV" onClick={() => downloadTaskCsv(task)} />
            <ActionBtn
              icon={icons.link}
              label="Copy ID"
              onClick={async () => {
                await copyText(task.id);
                flash("Task ID copied");
              }}
            />
            <ActionBtn icon={icons.open} label="Open" onClick={handleOpen} />
          </div>

          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {task.urls.map((url) => {
              const style = getStatusStyle(url.status);
              return (
                <div
                  key={url.id}
                  className="flex items-start gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2.5"
                >
                  <span
                    className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide"
                    style={{ color: style.color, background: style.bg }}
                  >
                    {displayStatus(url.status)}
                  </span>
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 break-all text-xs text-[var(--blue)] no-underline hover:underline"
                  >
                    {url.url}
                  </a>
                </div>
              );
            })}
          </div>

          {toast && <p className="mt-2 text-xs text-[var(--success)]">{toast}</p>}
        </div>
      )}
    </div>
  );
}
