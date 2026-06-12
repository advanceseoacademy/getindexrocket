"use client";

import { useEffect, useState } from "react";
import { CREDIT_PER_URL } from "@/lib/brand";
import { VERIFICATION_CREDIT_PER_URL, calculateSubmitCost } from "@/lib/submit-cost";
import { invalidateCache, invalidateDashboardCache } from "@/lib/client-cache";

type DashboardSubmitPanelProps = {
  creditBalance: number;
  onSubmitted?: () => void;
};

function Toggle({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "bg-[var(--blue)]" : "bg-[var(--bg3)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function DashboardSubmitPanel({
  creditBalance: initialBalance,
  onSubmitted,
}: DashboardSubmitPanelProps) {
  const [creditBalance, setCreditBalance] = useState(initialBalance);
  const [urls, setUrls] = useState("");
  const [taskName, setTaskName] = useState("");
  const [dripFeed, setDripFeed] = useState(false);
  const [smartVerification, setSmartVerification] = useState(false);
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
  const { indexCost, checkCost, total: cost } = calculateSubmitCost(urlCount, {
    smartVerification,
  });
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
        body: JSON.stringify({
          urls,
          taskName: taskName.trim() || undefined,
          smartVerification,
          dripFeed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed");
        return;
      }
      setSuccess(`${data.task.urlsCount} URL(s) submitted successfully.`);
      setUrls("");
      setTaskName("");
      setDripFeed(false);
      setSmartVerification(false);
      if (typeof data.creditBalance === "number") {
        setCreditBalance(data.creditBalance);
      }
      invalidateDashboardCache();
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
        <div className="rounded-xl border-2 border-[var(--blue)] bg-[var(--blue-08)] p-4">
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
        className="mt-4 flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-left text-xs text-[var(--muted)] hover:border-[var(--blue-25)] hover:text-[var(--text)]"
      >
        <span aria-hidden>⚙</span>
        <span>
          Advanced settings
          <span className="ml-1 text-[var(--muted2)]">
            (task name, drip feed, verification — usually not needed)
          </span>
        </span>
        <span className="ml-auto text-[10px]">{showAdvanced ? "▲" : "▼"}</span>
      </button>

      {showAdvanced && (
        <div className="mt-3 space-y-4 rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--bg2)] p-4">
          <div>
            <label htmlFor="task-name" className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              Task name (optional)
            </label>
            <input
              id="task-name"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              maxLength={120}
              placeholder="e.g. My New Blog Posts"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  Enable drip feed <span className="text-[var(--muted)]">∞</span>
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Coming soon</p>
              </div>
              <Toggle
                id="drip-feed"
                checked={dripFeed}
                onChange={setDripFeed}
                disabled
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  Smart index verification <span className="text-[var(--success)]">✓</span>
                </p>
                <p className="mt-0.5 text-xs text-[var(--success)]">
                  +{VERIFICATION_CREDIT_PER_URL} credit / link
                </p>
              </div>
              <Toggle
                id="smart-verification"
                checked={smartVerification}
                onChange={setSmartVerification}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-3 text-sm">
        <div className="flex justify-between text-[var(--muted)]">
          <span>URLs</span>
          <span className="text-[var(--text)]">{urlCount}</span>
        </div>
        <div className="mt-2 flex justify-between text-[var(--muted)]">
          <span>Cost</span>
          <div className="text-right">
            <span className="text-[var(--text)]">{cost} credits</span>
            <p className="mt-0.5 text-xs text-[var(--muted2)]">
              Index: {indexCost} · Check: {checkCost}
            </p>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[var(--muted)]">
          <span>Balance after submit</span>
          <div className="text-right">
            <span className="font-medium text-[var(--text)]">{Math.max(0, balanceAfter)}</span>
            <p className="mt-0.5 text-xs text-[var(--muted2)]">Now: {creditBalance}</p>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-[var(--success)]">{success}</p>}

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
