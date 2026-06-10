"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminBadge,
  AdminLoading,
  AdminPagination,
  AdminPanel,
  AdminSearchBar,
  AdminTable,
  formatDate,
  formatUsd,
} from "@/components/admin/admin-ui";

type PaymentRow = {
  id: string;
  email: string;
  userEmail: string | null;
  amountUsd: number;
  creditsAdded: number;
  intendedCredits: number;
  eventType: string | null;
  planId: string | null;
  createdAt: string;
};

export function AdminPayments() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20", filter });
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/payments?${params}`);
    const data = await res.json();
    if (res.ok) {
      setPayments(data.payments);
      setPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, query, filter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Buy Me a Coffee purchase history</p>
      </div>

      <AdminPanel
        title="Payment events"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="unreconciled">Unreconciled</option>
            </select>
            <AdminSearchBar value={q} onChange={setQ} placeholder="Search email…" />
          </div>
        }
      >
        {loading ? (
          <div className="p-8"><AdminLoading /></div>
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Payer email</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Credits</th>
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[var(--muted)]">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="px-5 py-3 text-xs text-[var(--muted)]">{formatDate(p.createdAt)}</td>
                      <td className="px-5 py-3">{p.email}</td>
                      <td className="px-5 py-3 text-xs">{p.userEmail ?? "—"}</td>
                      <td className="px-5 py-3">{formatUsd(p.amountUsd)}</td>
                      <td className="px-5 py-3">
                        {p.creditsAdded}
                        {p.intendedCredits > p.creditsAdded ? (
                          <span className="text-xs text-[var(--muted)]"> / {p.intendedCredits}</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-xs">{p.eventType ?? p.planId ?? "—"}</td>
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
            <AdminPagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </AdminPanel>
    </div>
  );
}
