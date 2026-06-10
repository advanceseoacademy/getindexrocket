"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardRecentTasks } from "@/components/dashboard/DashboardRecentTasks";
import { DashboardSubmitPanel } from "@/components/dashboard/DashboardSubmitPanel";
import { DashboardUsageChart } from "@/components/dashboard/DashboardUsageChart";
import { invalidateDashboardCache } from "@/lib/client-cache";
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

function StatCard({
  label,
  value,
  icon,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
  delay?: number;
}) {
  return (
    <div
      className="hover-lift stat-pop rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-2xl font-bold" style={accent ? { color: accent } : undefined}>
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--blue-12)] text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-[var(--bg3)]" />
          <div className="h-4 w-64 rounded bg-[var(--bg3)]" />
        </div>
        <div className="h-10 w-48 rounded-xl bg-[var(--bg3)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg3)]" />
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
  const res = await fetch(DASHBOARD_FAST, { credentials: "same-origin", cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.user ? (json as DashboardData) : null;
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

    fetchDashboard().then((json) => {
      if (!cancelled && json) setData(json);
    });

    setSyncing(true);
    fetch("/api/tasks/refresh-all", { method: "POST", credentials: "same-origin" })
      .then(() => fetchDashboard())
      .then((json) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDashboard().then((json) => {
          if (!cancelled && json) setData(json);
        });
      }
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleSubmitted = useCallback(() => {
    void load();
  }, [load]);

  if (!data) return <OverviewSkeleton />;

  const { user, stats, recentTasks, creditSpending } = data;
  const lowBalance = stats.creditBalance < LOW_BALANCE_THRESHOLD;

  return (
    <div className="animate-page-in space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Welcome to your indexing control center
            {user.name ? `, ${user.name}` : ""}.
            {syncing ? " Updating task status…" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2 text-sm font-medium">
            {stats.creditBalance} credits
          </span>
          <button
            type="button"
            onClick={() => navigateDashboard("/billing")}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--blue)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <span aria-hidden>🛒</span>
            Buy credits
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Balance" value={`${stats.creditBalance} credits`} icon="🎫" delay={0} />
        <StatCard label="Not crawled" value={String(stats.disappeared)} icon="🚀" delay={80} />
        <StatCard label="Total submitted" value={String(stats.totalSubmitted)} icon="📋" delay={160} />
        <StatCard
          label="Success rate"
          value={`${stats.successRate}%`}
          icon="✓"
          accent="var(--success)"
          delay={240}
        />
      </div>

      {lowBalance && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.1)] px-4 py-3 text-sm">
          <p className="text-[var(--amber)]">
            Low balance — you have {stats.creditBalance} credits left. Top up to keep submitting URLs.
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
          <DashboardSubmitPanel
            creditBalance={stats.creditBalance}
            onSubmitted={handleSubmitted}
          />
        </div>
        <div className="space-y-6">
          <DashboardRecentTasks tasks={recentTasks} onTasksChange={handleSubmitted} />
          <DashboardUsageChart data={creditSpending} />
        </div>
      </div>
    </div>
  );
}
