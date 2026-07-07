"use client";

import { useState } from "react";
import { CREDIT_PER_URL } from "@/lib/brand";
import { invalidateCache, invalidateDashboardCache } from "@/lib/client-cache";
import { consumeResubmitUrls } from "@/lib/resubmit-urls";

type SubmitFormProps = {
  creditBalance: number;
};

export function SubmitForm({ creditBalance: initialBalance }: SubmitFormProps) {
  const [creditBalance, setCreditBalance] = useState(initialBalance);
  const [urls, setUrls] = useState(consumeResubmitUrls);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const urlCount = urls.split(/\r?\n/).filter((l) => l.trim().startsWith("http")).length;
  const cost = CREDIT_PER_URL * urlCount;

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
      setSuccess(`${data.task.urlsCount} URL(s) submitted successfully!`);
      setUrls("");
      if (typeof data.creditBalance === "number") {
        setCreditBalance(data.creditBalance);
        invalidateDashboardCache();
        invalidateCache("/api/account");
        invalidateCache("/api/tasks");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-sm text-[var(--muted)]">
        <strong className="text-[var(--text)]">1 credit = 1 URL</strong> — paste one URL per line.
      </div>

      <div>
        <label className="mb-2 block text-sm text-[var(--muted)]">
          URL list (one per line)
        </label>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={10}
          required
          placeholder={"https://example.com/guest-post\nhttps://example.com/backlink"}
          className="w-full rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <span>
          {urlCount} URL × {CREDIT_PER_URL} credit ={" "}
          <strong className="text-[var(--text)]">{cost} credits</strong>
        </span>
        <span>Balance: {creditBalance} credits</span>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-[var(--success)]">{success}</p>}

      <button
        type="submit"
        disabled={loading || urlCount === 0 || cost > creditBalance}
        className="w-full rounded-[10px] bg-[var(--green)] py-3.5 font-semibold text-[var(--on-accent)] disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit URLs"}
      </button>
    </form>
  );
}
