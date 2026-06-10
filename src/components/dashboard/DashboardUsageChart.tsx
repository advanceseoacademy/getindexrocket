"use client";

import type { SpendingPoint } from "@/lib/credit-spending";

type DashboardUsageChartProps = {
  data: SpendingPoint[];
};

const CHART_HEIGHT = 112;

function formatDayLabel(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function DashboardUsageChart({ data }: DashboardUsageChartProps) {
  const max = Math.max(...data.map((d) => d.credits), 1);
  const total = data.reduce((sum, d) => sum + d.credits, 0);

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Credits spent (last 14 days)</h2>
        <span className="text-lg font-bold text-[var(--blue)]">{total}</span>
      </div>

      {total === 0 ? (
        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          No credits spent in the last 14 days
        </p>
      ) : (
        <div className="mt-5 flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
          {data.map((point) => {
            const barHeight =
              point.credits > 0
                ? Math.max(6, Math.round((point.credits / max) * (CHART_HEIGHT - 8)))
                : 3;

            return (
              <div key={point.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full min-w-[4px] rounded-t bg-[var(--blue)] opacity-80 transition-all group-hover:opacity-100"
                  style={{ height: barHeight }}
                  title={`${formatDayLabel(point.date)}: ${point.credits} credits`}
                />
                <span className="hidden text-center text-[9px] leading-tight text-[var(--muted2)] sm:block">
                  {formatDayLabel(point.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
