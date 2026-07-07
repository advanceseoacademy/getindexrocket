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
} from "@/components/admin/admin-ui";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  creditBalance: number;
  authMethod: string;
  linkCount: number;
  createdAt: string;
  _count: { tasks: number; paymentEvents: number; sessions: number };
};

type SubmittedUrl = {
  id: string;
  url: string;
  status: string;
  indexedAt: string | null;
  submittedAt: string;
  task: {
    id: string;
    status: string;
    tier: string;
    providerTaskId: string | null;
    createdAt: string;
  };
};

type UserDetail = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  creditBalance: number;
  createdAt: string;
  _count: { tasks: number; sessions: number; paymentEvents: number; memberships: number };
  creditTransactions: {
    id: string;
    amount: number;
    balanceAfter: number;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
  paymentEvents: {
    id: string;
    amountUsd: number;
    creditsAdded: number;
    eventType: string | null;
    createdAt: string;
  }[];
};

export function AdminUsers() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [grantAmount, setGrantAmount] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [userUrls, setUserUrls] = useState<SubmittedUrl[]>([]);
  const [urlTotal, setUrlTotal] = useState(0);
  const [urlPages, setUrlPages] = useState(1);
  const [urlPage, setUrlPage] = useState(1);
  const [urlQ, setUrlQ] = useState("");
  const [urlQuery, setUrlQuery] = useState("");
  const [urlsLoading, setUrlsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      setPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, query]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function loadDetail(id: string) {
    setActionMsg("");
    setActionErr("");
    setUrlPage(1);
    setUrlQ("");
    setUrlQuery("");
    const res = await fetch(`/api/admin/users/${id}`);
    const data = await res.json();
    if (res.ok) setSelected(data.user);
  }

  const loadUserUrls = useCallback(async (userId: string, page: number, query: string) => {
    setUrlsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (query) params.set("q", query);
    const res = await fetch(`/api/admin/users/${userId}/urls?${params}`);
    const data = await res.json();
    if (res.ok) {
      setUserUrls(data.urls);
      setUrlTotal(data.totalLinks);
      setUrlPages(data.pagination.pages);
    }
    setUrlsLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setUrlQuery(urlQ);
      setUrlPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [urlQ]);

  useEffect(() => {
    if (!selected) return;
    loadUserUrls(selected.id, urlPage, urlQuery);
  }, [selected, urlPage, urlQuery, loadUserUrls]);

  async function patchUser(action: string, extra: Record<string, unknown> = {}) {
    if (!selected) return;
    setActionMsg("");
    setActionErr("");
    const res = await fetch(`/api/admin/users/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionErr(data.error ?? "Action failed");
      return;
    }
    setActionMsg("Updated successfully");
    setGrantAmount("");
    await loadDetail(selected.id);
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage accounts, credits, and roles</p>
      </div>

      <AdminPanel
        title="All users"
        action={<AdminSearchBar value={q} onChange={setQ} placeholder="Search email or name…" />}
      >
        {loading ? (
          <div className="p-8"><AdminLoading /></div>
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Credits</th>
                  <th className="px-5 py-3 font-medium">Links</th>
                  <th className="px-5 py-3 font-medium">Tasks</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="px-5 py-3">
                      <div>{u.email}</div>
                      {u.name ? <div className="text-xs text-[var(--muted)]">{u.name}</div> : null}
                    </td>
                    <td className="px-5 py-3">
                      <AdminBadge tone={u.role === "admin" ? "orange" : "default"}>{u.role}</AdminBadge>
                    </td>
                    <td className="px-5 py-3 font-medium">{u.creditBalance}</td>
                    <td className="px-5 py-3">{u.linkCount}</td>
                    <td className="px-5 py-3">{u._count.tasks}</td>
                    <td className="px-5 py-3 text-xs text-[var(--muted)]">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => loadDetail(u.id)}
                        className="text-xs text-[var(--blue)] hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
            <AdminPagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </AdminPanel>

      {selected ? (
        <AdminPanel
          title={`Submitted links (${urlTotal})`}
          action={
            <AdminSearchBar value={urlQ} onChange={setUrlQ} placeholder="Search URL…" />
          }
        >
          {urlsLoading ? (
            <div className="p-8"><AdminLoading /></div>
          ) : (
            <>
              <AdminTable>
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
                    <th className="px-5 py-3 font-medium">Submitted</th>
                    <th className="px-5 py-3 font-medium">URL</th>
                    <th className="px-5 py-3 font-medium">Link status</th>
                    <th className="px-5 py-3 font-medium">Task</th>
                    <th className="px-5 py-3 font-medium">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {userUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                        No links submitted yet
                      </td>
                    </tr>
                  ) : (
                    userUrls.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--card-border)] last:border-0">
                        <td className="px-5 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                          {formatDate(u.submittedAt)}
                        </td>
                        <td className="max-w-md px-5 py-3">
                          <a
                            href={u.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-xs text-[var(--blue)] no-underline hover:underline"
                          >
                            {u.url}
                          </a>
                        </td>
                        <td className="px-5 py-3">
                          <AdminBadge
                            tone={
                              u.status === "indexed" || u.status === "crawled"
                                ? "green"
                                : u.status === "failed"
                                  ? "red"
                                  : "orange"
                            }
                          >
                            {u.status}
                          </AdminBadge>
                        </td>
                        <td className="px-5 py-3 text-xs text-[var(--muted)]">
                          {u.task.providerTaskId ? `#${u.task.providerTaskId}` : u.task.id.slice(0, 8)}
                          <span className="ml-1">({u.task.status})</span>
                        </td>
                        <td className="px-5 py-3 capitalize text-xs">{u.task.tier}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </AdminTable>
              <AdminPagination page={urlPage} pages={urlPages} onPage={setUrlPage} />
            </>
          )}
        </AdminPanel>
      ) : null}

      {selected ? (
        <AdminPanel title={`User: ${selected.email}`}>
          <div className="space-y-6 p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-[var(--muted)]">Credits</p>
                <p className="text-xl font-bold">{selected.creditBalance}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Role</p>
                <p className="text-xl font-bold capitalize">{selected.role}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Tasks</p>
                <p className="text-xl font-bold">{selected._count.tasks}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Sessions</p>
                <p className="text-xl font-bold">{selected._count.sessions}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="Credits"
                  className="w-24 rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => patchUser("grant_credits", { amount: Number(grantAmount) })}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--on-accent)]"
                >
                  Grant credits
                </button>
                <button
                  type="button"
                  onClick={() => patchUser("deduct_credits", { amount: Number(grantAmount) })}
                  className="rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm"
                >
                  Deduct
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  patchUser("set_role", {
                    role: selected.role === "admin" ? "user" : "admin",
                  })
                }
                className="rounded-lg border border-[var(--orange)] px-4 py-2 text-sm text-[var(--orange)]"
              >
                {selected.role === "admin" ? "Remove admin" : "Make admin"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg px-4 py-2 text-sm text-[var(--muted)]"
              >
                Close
              </button>
            </div>

            {actionMsg ? <p className="text-sm text-[var(--success)]">{actionMsg}</p> : null}
            {actionErr ? <p className="text-sm text-[#f87171]">{actionErr}</p> : null}

            <div>
              <h3 className="mb-3 text-sm font-semibold">Recent credit transactions</h3>
              <AdminTable>
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.creditTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="py-2 text-xs text-[var(--muted)]">{formatDate(t.createdAt)}</td>
                      <td className="py-2">{t.type}</td>
                      <td className={`py-2 font-medium ${t.amount >= 0 ? "text-[var(--success)]" : "text-[#f87171]"}`}>
                        {t.amount >= 0 ? "+" : ""}
                        {t.amount}
                      </td>
                      <td className="py-2">{t.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </div>
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}
