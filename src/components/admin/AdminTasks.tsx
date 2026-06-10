"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  AdminBadge,
  AdminLoading,
  AdminPagination,
  AdminPanel,
  AdminSearchBar,
  AdminTable,
  formatDate,
} from "@/components/admin/admin-ui";

type TaskUrl = {
  id: string;
  url: string;
  status: string;
  indexedAt: string | null;
  submittedAt: string;
};

type TaskRow = {
  id: string;
  externalId: string | null;
  providerTaskId: string | null;
  userEmail: string;
  tier: string;
  status: string;
  urlsCount: number;
  creditsCharged: number;
  createdAt: string;
  urls: TaskUrl[];
};

const STATUS_TONE: Record<string, "default" | "green" | "orange" | "red" | "blue"> = {
  completed: "green",
  crawled: "green",
  processing: "blue",
  pending: "orange",
  failed: "red",
};

export function AdminTasks() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/tasks?${params}`);
    const data = await res.json();
    if (res.ok) {
      setTasks(data.tasks);
      setPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, query, status]);

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
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          All indexing tasks and submitted links across users
        </p>
      </div>

      <AdminPanel
        title="Indexing tasks"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <AdminSearchBar value={q} onChange={setQ} placeholder="Search user, task ID, or URL…" />
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
                  <th className="px-5 py-3 font-medium">Task ID</th>
                  <th className="px-5 py-3 font-medium">URLs</th>
                  <th className="px-5 py-3 font-medium">Credits</th>
                  <th className="px-5 py-3 font-medium">Tier</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-[var(--muted)]">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <Fragment key={t.id}>
                      <tr className="border-b border-[var(--card-border)]">
                        <td className="px-5 py-3 text-xs text-[var(--muted)]">{formatDate(t.createdAt)}</td>
                        <td className="px-5 py-3 text-xs">{t.userEmail}</td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {t.providerTaskId ? `#${t.providerTaskId}` : t.externalId?.slice(0, 8) ?? t.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-3">{t.urlsCount}</td>
                        <td className="px-5 py-3">{t.creditsCharged}</td>
                        <td className="px-5 py-3 capitalize">{t.tier}</td>
                        <td className="px-5 py-3">
                          <AdminBadge tone={STATUS_TONE[t.status] ?? "default"}>{t.status}</AdminBadge>
                        </td>
                        <td className="px-5 py-3">
                          {t.urls.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                              className="text-xs text-[var(--blue)] hover:underline"
                            >
                              {expanded === t.id ? "Hide links" : "View links"}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                      {expanded === t.id && t.urls.length > 0 ? (
                        <tr className="border-b border-[var(--card-border)] bg-[var(--bg2)]">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="space-y-2">
                              {t.urls.map((u) => (
                                <div
                                  key={u.id}
                                  className="flex flex-wrap items-center gap-3 text-xs"
                                >
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
                                  <a
                                    href={u.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all text-[var(--blue)] no-underline hover:underline"
                                  >
                                    {u.url}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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
