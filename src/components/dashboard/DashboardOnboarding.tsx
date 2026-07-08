"use client";

import { useEffect, useState } from "react";
import { navigateDashboard } from "@/lib/dashboard-nav";

const STORAGE_KEY = "gir_onboarding_dismissed";

export function DashboardOnboarding({ hasTasks }: { hasTasks: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasTasks) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [hasTasks]);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  const steps = [
    { n: "1", title: "Paste URLs", desc: "Submit guest posts, niche edits, or bulk URL lists — 1 credit each." },
    { n: "2", title: "Track pipeline", desc: "Watch Submitted → Processing → Crawled or Refunded in My Tasks." },
    { n: "3", title: "Get refunded", desc: "Credits return automatically when crawl verification fails." },
  ];

  return (
    <div className="rounded-2xl border border-[var(--blue-22)] bg-gradient-to-br from-[var(--blue-08)] to-[var(--bg2)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--blue)]">Getting started</p>
          <h2 className="mt-1 text-lg font-bold">Welcome to your indexing dashboard</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Three steps to submit your first backlink and track honest crawl status.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          Dismiss
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--blue)] text-xs font-bold text-white">
              {s.n}
            </span>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{s.desc}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          dismiss();
          navigateDashboard("/dashboard");
        }}
        className="btn btn-primary btn-md mt-6"
      >
        Submit your first URL
      </button>
    </div>
  );
}
