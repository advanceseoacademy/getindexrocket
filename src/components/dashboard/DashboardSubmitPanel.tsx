"use client";

import { useEffect, useState } from "react";
import { CREDIT_PER_URL } from "@/lib/brand";
import { invalidateCache } from "@/lib/client-cache";

type DashboardSubmitPanelProps = {
  creditBalance: number;
  onSubmitted?: () => void;
};

export function DashboardSubmitPanel({
  creditBalance: initialBalance,
  onSubmitted,
}: DashboardSubmitPanelProps) {
  const [creditBalance, setCreditBalance] = useState(initialBalance);
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const pending = sessionStorage.getItem("gir_resubmit_urls");
    if (pending) {
      setUrls(pending);
      sessionStorage.removeItem("gir_resubmit_urls");
    }
  }, []);

  const urlCount = urls.split(/\r?\n/).filter((l) => l.trim().startsWith("http")).length;
  const cost = CREDIT_PER_URL * urlCount;
  const balanceAfter = creditBalance - cost;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed");
        return;
      }
      setSuccess(`${data.task.urlsCount} URL(s) submitted successfully.`);
      setUrls("");
      if (typeof data.creditBalance === "number") {
        setCreditBalance(data.creditBalance);
      }
      invalidateCache("/api/dashboard");
      invalidateCache("/api/account");
      invalidateCache("/api/tasks");
      onSubmitted?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.startsWith("http"));
      if (lines.length) setUrls((prev) => (prev ? `${prev}\n${lines.join("\n")}` : lines.join("\n")));
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold">Create new task</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Search engine</label>
          <select
            disabled
            className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2.5 text-sm text-[var(--text)]"
          >
            <option>Google</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Task type</label>
          <select
            disabled
            className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2.5 text-sm text-[var(--text)]"
          >
            <option>Indexer</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-[var(--muted)]">URL list</label>
          <div className="flex gap-2">
            <label className="cursor-pointer rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]">
              Upload file
              <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={8}
          placeholder={"https://example.com/guest-post\nhttps://example.com/backlink"}
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-[var(--blue)] bg-[rgba(59,143,255,0.08)] p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden>
              🐢
            </span>
            <div>
              <p className="font-medium">Standard</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Up to 48 hours</p>
              <p className="mt-2 text-xs font-medium text-[var(--blue)]">{CREDIT_PER_URL} credit / link</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] p-4 opacity-50">
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden>
              ⚡
            </span>
            <div>
              <p className="font-medium">Instant</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
      >
        <span aria-hidden>⚙</span>
        Advanced settings
        <span className="text-[10px]">{showAdvanced ? "▲" : "▼"}</span>
      </button>

      {showAdvanced && (
        <p className="mt-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-2 text-xs text-[var(--muted)]">
          Standard indexing tier is used for all submissions. Duplicate URLs are not charged again.
        </p>
      )}

      <div className="mt-5 rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-sm">
        <div className="flex justify-between text-[var(--muted)]">
          <span>URLs</span>
          <span className="text-[var(--text)]">{urlCount}</span>
        </div>
        <div className="mt-2 flex justify-between text-[var(--muted)]">
          <span>Cost</span>
          <span className="text-[var(--text)]">{cost} credits</span>
        </div>
        <div className="mt-2 flex justify-between text-[var(--muted)]">
          <span>Balance after submit</span>
          <span className="font-medium text-[var(--text)]">{Math.max(0, balanceAfter)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-[var(--green)]">{success}</p>}

      <button
        type="submit"
        disabled={loading || urlCount === 0 || cost > creditBalance}
        className="mt-5 w-full rounded-xl bg-[var(--blue)] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
