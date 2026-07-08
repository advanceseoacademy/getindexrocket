"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardOnboarding } from "@/components/dashboard/DashboardOnboarding";
import { DashboardRecentTasks } from "@/components/dashboard/DashboardRecentTasks";
import { DashboardSubmitPanel } from "@/components/dashboard/DashboardSubmitPanel";
import { DashboardUsageChart } from "@/components/dashboard/DashboardUsageChart";
import { DashboardStatCard } from "@/components/dashboard/dashboard-ui";
import { fetchCached, invalidateDashboardCache, peekCached } from "@/lib/client-cache";
import { navigateDashboard } from "@/lib/dashboard-nav";
import type { SerializedTask } from "@/lib/tasks-serialize";

const LOW_BALANCE_THRESHOLD = 15;
const DASHBOARD_FAST = "/api/dashboard?skipSync=1";

type DashboardStats = {
  creditBalance: number;
  totalSubmitted: number;
  taskCount: number;
  successRate: number;
  disappeared: number;
  processing: number;
  completed: number;
  failed: number;
};

type DashboardData = {
  user: { name: string | null; email: string; creditBalance: number };
  stats: DashboardStats;
  recentTasks: SerializedTask[];
  creditSpending: { date: string; credits: number }[];
};

function OverviewSkeleton() {
  return (
    <div className="dash-skeleton animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-[var(--bg3)]" />
          <div className="h-4 w-64 rounded bg-[var(--bg3)]" />
        </div>
        <div className="h-10 w-48 rounded-xl bg-[var(--bg3)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-[var(--bg3)]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[520px] rounded-2xl bg-[var(--bg3)] lg:col-span-2" />
        <div className="space-y-4">
          <div className="h-80 rounded-2xl bg-[var(--bg3)]" />
          <div className="h-40 rounded-2xl bg-[var(--bg3)]" />
        </div>
      </div>
    </div>
  );
}

async function fetchDashboard() {
  return fetchCached<DashboardData>(DASHBOARD_FAST, 30_000).catch(() => null);
}

export function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    invalidateDashboardCache();
    const json = await fetchDashboard();
    if (json) setData(json);
    return json;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const cached = peekCached<DashboardData>(DASHBOARD_FAST);
    if (cached) setData(cached);

    fetchDashboard().then((json) => {
      if (!cancelled && json) setData(json);
    });

    // Background sync — don't block first paint
    const syncTimer = window.setTimeout(() => {
      setSyncing(true);
      fetch("/api/tasks/refresh-all", { method: "POST", credentials: "same-origin" })
        .then(() => {
          invalidateDashboardCache();
          return fetchDashboard();
        })
        .then((json) => {
          if (!cancelled && json) setData(json);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setSyncing(false);
        });
    }, 800);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDashboard().then((json) => {
          if (!cancelled && json) setData(json);
        });
      }
    }, 30_000);

    return () => {
      cancelled = true;
      clearTimeout(syncTimer);
      clearInterval(interval);
    };
  }, []);

  const handleSubmitted = useCallback(() => {
    void load();
  }, [load]);

  if (!data) return <OverviewSkeleton />;

  const { user, stats, recentTasks, creditSpending } = data;
  const lowBalance = stats.creditBalance < LOW_BALANCE_THRESHOLD;
  const hasTasks = stats.taskCount > 0;

  return (
    <div className="animate-page-in space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Welcome back{user.name ? `, ${user.name}` : ""}.
            {syncing ? (
              <span className="ml-1 text-[var(--blue)]">Syncing task status…</span>
            ) : (
              <span className="ml-1">Track crawl status across {stats.taskCount} task{stats.taskCount !== 1 ? "s" : ""}.</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2 text-sm font-medium tabular-nums">
            {stats.creditBalance} credits
          </span>
          <button
            type="button"
            onClick={() => navigateDashboard("/billing")}
            className="btn btn-primary btn-md"
          >
            Buy credits
          </button>
        </div>
      </div>

      {!hasTasks && <DashboardOnboarding hasTasks={hasTasks} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Credit balance"
          value={stats.creditBalance}
          sub={`${stats.totalSubmitted} URLs submitted`}
          icon={<span aria-hidden>🎫</span>}
        />
        <DashboardStatCard
          label="Crawled"
          value={stats.completed}
          sub="Verified in Google"
          accent="var(--success)"
          icon={<span aria-hidden>✓</span>}
        />
        <DashboardStatCard
          label="In progress"
          value={stats.processing}
          sub="Submitted or processing"
          accent="var(--blue)"
          icon={<span aria-hidden>⟳</span>}
        />
        <DashboardStatCard
          label="Success rate"
          value={`${stats.successRate}%`}
          sub={`${stats.disappeared} refunded / failed`}
          accent={stats.successRate >= 70 ? "var(--success)" : "var(--amber)"}
          icon={<span aria-hidden>📊</span>}
        />
      </div>

      {lowBalance && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] px-4 py-3 text-sm"
          role="status"
        >
          <p className="text-[var(--amber)]">
            Low balance — {stats.creditBalance} credits left. Top up to keep submitting URLs.
          </p>
          <button
            type="button"
            onClick={() => navigateDashboard("/billing")}
            className="shrink-0 rounded-lg bg-[var(--amber)] px-4 py-2 text-xs font-semibold text-[#1a1200]"
          >
            Top up
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardSubmitPanel creditBalance={stats.creditBalance} onSubmitted={handleSubmitted} />
        </div>
        <div className="space-y-6">
          <DashboardRecentTasks tasks={recentTasks} onTasksChange={handleSubmitted} />
          <DashboardUsageChart data={creditSpending} />
        </div>
      </div>
    </div>
  );
}
