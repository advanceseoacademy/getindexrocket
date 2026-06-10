"use client";

import { useEffect, useState } from "react";
import {
  AdminBadge,
  AdminLoading,
  AdminPanel,
  AdminStatCard,
  AdminTable,
  formatDate,
  formatUsd,
} from "@/components/admin/admin-ui";

type Stats = {
  users: { total: number; admins: number; new30d: number };
  credits: { totalUserBalance: number; providerBalance: number | null; providerEmail: string | null };
  tasks: { total: number; last30d: number };
  payments: { total: number; unreconciled: number; revenue30d: number; creditsSold30d: number };
  memberships: { active: number };
  recentPayments: {
    id: string;
    email: string;
    userEmail: string | null;
    amountUsd: number;
    creditsAdded: number;
    intendedCredits: number;
    eventType: string | null;
    createdAt: string;
  }[];
};

export function AdminOverview() {
  const [data, setData] = useState<Stats | null>(null);
  const [providerLoading, setProviderLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then((stats) => {
        if (cancelled) return;
        setData(stats);
        return fetch("/api/admin/stats?provider=1");
      })
      .then((r) => {
        if (!r || cancelled) return;
        return r.json();
      })
      .then((providerData) => {
        if (cancelled || !providerData?.credits) return;
        setData((prev) =>
          prev
            ? {
                ...prev,
                credits: {
                  ...prev.credits,
                  providerBalance: providerData.credits.providerBalance,
                  providerEmail: providerData.credits.providerEmail,
                },
              }
            : prev,
        );
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setProviderLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-[#f87171]">{error}</p>;
  }
  if (!data) return <AdminLoading />;

  const liability =
    data.credits.providerBalance != null
      ? data.credits.totalUserBalance - data.credits.providerBalance
      : null;

  const providerSub = providerLoading
    ? "Loading provider balance…"
    : data.credits.providerBalance != null
      ? `Provider: ${data.credits.providerBalance}`
      : "Provider balance unavailable";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Platform stats and recent activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total users" value={String(data.users.total)} sub={`+${data.users.new30d} last 30d`} />
        <AdminStatCard
          label="Revenue (30d)"
          value={formatUsd(data.payments.revenue30d)}
          sub={`${data.payments.creditsSold30d} credits sold`}
          accent="var(--accent)"
        />
        <AdminStatCard label="Total tasks" value={String(data.tasks.total)} sub={`${data.tasks.last30d} last 30d`} />
        <AdminStatCard
          label="User credits"
          value={String(data.credits.totalUserBalance)}
          sub={providerSub}
          accent={liability != null && liability > 0 ? "#f87171" : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Active memberships" value={String(data.memberships.active)} />
        <AdminStatCard
          label="Unreconciled payments"
          value={String(data.payments.unreconciled)}
          accent={data.payments.unreconciled > 0 ? "var(--orange)" : undefined}
        />
        <AdminStatCard label="Admins" value={String(data.users.admins)} />
      </div>

      <AdminPanel title="Recent payments">
        <AdminTable>
          <thead>
            <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Credits</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                  No payments yet
                </td>
              </tr>
            ) : (
              data.recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-[var(--card-border)] last:border-0">
                  <td className="px-5 py-3 text-xs text-[var(--muted)]">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div>{p.email}</div>
                    {p.userEmail && p.userEmail !== p.email ? (
                      <div className="text-xs text-[var(--muted)]">→ {p.userEmail}</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3">{formatUsd(p.amountUsd)}</td>
                  <td className="px-5 py-3">
                    {p.creditsAdded}
                    {p.intendedCredits > p.creditsAdded ? (
                      <span className="text-xs text-[var(--muted)]"> / {p.intendedCredits}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3">
                    {!p.userEmail ? (
                      <AdminBadge tone="orange">Orphan</AdminBadge>
                    ) : p.creditsAdded === 0 && p.intendedCredits > 0 ? (
                      <AdminBadge tone="red">Pending</AdminBadge>
                    ) : (
                      <AdminBadge tone="green">Credited</AdminBadge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminPanel>
    </div>
  );
}
