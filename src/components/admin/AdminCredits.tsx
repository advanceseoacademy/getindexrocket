"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminLoading,
  AdminPagination,
  AdminPanel,
  AdminSearchBar,
  AdminTable,
  formatDate,
} from "@/components/admin/admin-ui";

type TxRow = {
  id: string;
  userEmail: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string | null;
  createdAt: string;
};

const TYPES = [
  "",
  "submit",
  "refund",
  "bmc_purchase",
  "bmc_membership_started",
  "bmc_membership_renewal",
  "payment_reconcile",
  "admin_grant",
  "admin_deduct",
];

export function AdminCredits() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    const res = await fetch(`/api/admin/credits?${params}`);
    const data = await res.json();
    if (res.ok) {
      setTransactions(data.transactions);
      setPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, query, type]);

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
        <h1 className="text-2xl font-bold">Credit ledger</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">All credit transactions platform-wide</p>
      </div>

      <AdminPanel
        title="Transactions"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t || "all"} value={t}>
                  {t || "All types"}
                </option>
              ))}
            </select>
            <AdminSearchBar value={q} onChange={setQ} placeholder="Search user email…" />
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
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Balance after</th>
                  <th className="px-5 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[var(--muted)]">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="px-5 py-3 text-xs text-[var(--muted)]">{formatDate(t.createdAt)}</td>
                      <td className="px-5 py-3 text-xs">{t.userEmail}</td>
                      <td className="px-5 py-3">{t.type}</td>
                      <td
                        className={`px-5 py-3 font-medium ${t.amount >= 0 ? "text-[var(--success)]" : "text-[#f87171]"}`}
                      >
                        {t.amount >= 0 ? "+" : ""}
                        {t.amount}
                      </td>
                      <td className="px-5 py-3">{t.balanceAfter}</td>
                      <td className="max-w-[200px] truncate px-5 py-3 text-xs text-[var(--muted)]">
                        {t.description ?? "—"}
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
