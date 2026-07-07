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
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type SerializedTicket,
} from "@/lib/tickets";

const STATUS_TONE: Record<string, "default" | "green" | "orange" | "red" | "blue"> = {
  open: "orange",
  in_progress: "blue",
  resolved: "green",
  closed: "default",
};

export function AdminTickets() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState<SerializedTicket[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<SerializedTicket | null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/tickets?${params}`);
    const data = await res.json();
    if (res.ok) {
      setTickets(data.tickets);
      setPages(data.pagination.pages);
    }
    setLoading(false);
  }, [page, query, status]);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/tickets/${id}`);
    const data = await res.json();
    if (res.ok) setDetail(data.ticket);
  }, []);

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

  useEffect(() => {
    if (expanded) void loadDetail(expanded);
    else setDetail(null);
  }, [expanded, loadDetail]);

  async function patchTicket(id: string, patch: { status?: string; priority?: string }) {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Update failed");
      return;
    }
    setDetail(data.ticket);
    void load();
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!expanded || !reply.trim()) return;
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/tickets/${expanded}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error ?? "Reply failed");
      return;
    }
    setReply("");
    setDetail(data.ticket);
    void load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support tickets</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">User support requests and replies</p>
      </div>

      <AdminPanel
        title="Tickets"
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
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <AdminSearchBar value={q} onChange={setQ} placeholder="Search subject, email, ID…" />
          </div>
        }
      >
        {loading ? (
          <div className="p-8">
            <AdminLoading />
          </div>
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr className="border-b border-[var(--card-border)] text-xs text-[var(--muted)]">
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Msgs</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[var(--muted)]">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <Fragment key={ticket.id}>
                      <tr
                        className="cursor-pointer border-b border-[var(--card-border)] hover:bg-[var(--bg2)]"
                        onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                      >
                        <td className="px-5 py-3 text-xs text-[var(--muted)]">
                          {formatDate(ticket.updatedAt)}
                        </td>
                        <td className="px-5 py-3 text-sm">{ticket.userEmail}</td>
                        <td className="px-5 py-3 text-sm">
                          <span className="text-xs text-[var(--muted)]">{ticket.ref}</span>
                          <div className="font-medium">{ticket.subject}</div>
                        </td>
                        <td className="px-5 py-3">
                          <AdminBadge tone={STATUS_TONE[ticket.status] ?? "default"}>
                            {ticket.status.replace("_", " ")}
                          </AdminBadge>
                        </td>
                        <td className="px-5 py-3 text-sm capitalize">{ticket.priority}</td>
                        <td className="px-5 py-3 text-sm">{ticket.messageCount ?? 0}</td>
                      </tr>
                      {expanded === ticket.id && detail ? (
                        <tr className="bg-[var(--bg2)]">
                          <td colSpan={6} className="px-5 py-5">
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-3">
                                <select
                                  value={detail.status}
                                  disabled={saving}
                                  onChange={(e) => patchTicket(detail.id, { status: e.target.value })}
                                  className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
                                >
                                  {TICKET_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s.replace("_", " ")}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={detail.priority}
                                  disabled={saving}
                                  onChange={(e) => patchTicket(detail.id, { priority: e.target.value })}
                                  className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
                                >
                                  {TICKET_PRIORITIES.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="max-h-80 space-y-3 overflow-y-auto">
                                {(detail.messages ?? []).map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`rounded-xl border p-3 text-sm ${
                                      msg.isStaff
                                        ? "border-[var(--blue-12)] bg-[var(--card)]"
                                        : "border-[var(--card-border)] bg-[var(--bg3)]"
                                    }`}
                                  >
                                    <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                                      <span>{msg.isStaff ? "Staff" : "User"}</span>
                                      <span>{formatDate(msg.createdAt)}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{msg.body}</p>
                                  </div>
                                ))}
                              </div>

                              <form onSubmit={sendReply} className="space-y-2">
                                <textarea
                                  value={reply}
                                  onChange={(e) => setReply(e.target.value)}
                                  rows={3}
                                  placeholder="Staff reply…"
                                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
                                />
                                <button
                                  type="submit"
                                  disabled={saving || !reply.trim()}
                                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] disabled:opacity-50"
                                >
                                  {saving ? "Sending…" : "Send reply"}
                                </button>
                              </form>

                              {msg ? <p className="text-sm text-red-400">{msg}</p> : null}
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
