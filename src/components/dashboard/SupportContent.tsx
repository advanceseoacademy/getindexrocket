"use client";

import { useCallback, useEffect, useState } from "react";
import { canUserReply, type SerializedTicket } from "@/lib/tickets";

type View = "list" | "create" | "detail";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-[var(--blue-12)] text-[var(--blue)]",
  in_progress: "bg-[rgba(245,166,35,0.14)] text-[var(--amber)]",
  resolved: "bg-[var(--blue-14)] text-[var(--success)]",
  closed: "bg-[rgba(255,255,255,0.06)] text-[var(--muted)]",
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SupportContent() {
  const [view, setView] = useState<View>("list");
  const [tickets, setTickets] = useState<SerializedTicket[]>([]);
  const [selected, setSelected] = useState<SerializedTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/tickets", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load tickets");
      setLoading(false);
      return;
    }
    setTickets(data.tickets ?? []);
    setLoading(false);
  }, []);

  const loadTicket = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/tickets/${id}`, { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load ticket");
      setLoading(false);
      return;
    }
    setSelected(data.ticket);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (view === "list") loadTickets();
  }, [view, loadTickets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create ticket");
      return;
    }
    setSubject("");
    setBody("");
    setSelected(data.ticket);
    setView("detail");
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/tickets/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ body: reply }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to send reply");
      return;
    }
    setReply("");
    setSelected(data.ticket);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Open a ticket and our team will get back to you.
          </p>
        </div>
        {view === "list" ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setView("create");
            }}
            className="rounded-xl bg-[var(--green)] px-4 py-2 text-sm font-semibold text-black"
          >
            New ticket
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError("");
              setSelected(null);
              setView("list");
            }}
            className="rounded-xl border border-[var(--card-border)] px-4 py-2 text-sm text-[var(--muted)]"
          >
            ← All tickets
          </button>
        )}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {view === "create" ? (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-4"
        >
          <h2 className="font-semibold">New support ticket</h2>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              placeholder="Brief summary of your issue"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={10}
              rows={6}
              placeholder="Describe your issue in detail…"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Submitting…" : "Submit ticket"}
          </button>
        </form>
      ) : null}

      {view === "list" ? (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-[var(--muted)]">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--muted)]">
              No tickets yet. Click &quot;New ticket&quot; to contact support.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--card-border)]">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setView("detail");
                      void loadTicket(ticket.id);
                    }}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--bg2)]"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {ticket.ref} · {formatWhen(ticket.updatedAt)} · {ticket.messageCount ?? 0}{" "}
                        message(s)
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open}`}
                    >
                      {STATUS_LABEL[ticket.status] ?? ticket.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {view === "detail" && selected ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--muted)]">{selected.ref}</p>
                <h2 className="mt-1 text-lg font-semibold">{selected.subject}</h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[selected.status] ?? STATUS_STYLE.open}`}
              >
                {STATUS_LABEL[selected.status] ?? selected.status}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {(selected.messages ?? []).map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl border p-4 ${
                  msg.isStaff
                    ? "border-[var(--blue-12)] bg-[var(--blue-10)]"
                    : "border-[var(--card-border)] bg-[var(--card)]"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span>{msg.isStaff ? "Support team" : "You"}</span>
                  <span>{formatWhen(msg.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
              </div>
            ))}
          </div>

          {canUserReply(selected.status) ? (
            <form
              onSubmit={handleReply}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-3"
            >
              <h3 className="text-sm font-semibold">Reply</h3>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                required
                rows={4}
                placeholder="Write your reply…"
                className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Sending…" : "Send reply"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-[var(--muted)]">This ticket is closed. Open a new ticket if you need more help.</p>
          )}
        </div>
      ) : null}

      {view === "detail" && loading && !selected ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--bg3)]" />
      ) : null}
    </div>
  );
}
