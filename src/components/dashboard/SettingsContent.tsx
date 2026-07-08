"use client";

import { useEffect, useState } from "react";
import { fetchCached, peekCached } from "@/lib/client-cache";

type AccountUser = { email: string; creditBalance: number };
type AccountResponse = { user: AccountUser };

const ACCOUNT_URL = "/api/account";

function Skeleton() {
  return <div className="mt-8 h-40 animate-pulse rounded-2xl bg-[var(--bg3)]" />;
}

export function SettingsContent() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cached = peekCached<AccountResponse>(ACCOUNT_URL)?.user;
    if (cached) setUser(cached);

    fetchCached<AccountResponse>(ACCOUNT_URL, 60_000)
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setError("Could not load account settings.");
      })
      .catch(() => setError("Could not load account settings."));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center" role="alert">
        <p className="text-sm text-red-300">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-ghost btn-sm mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!user) return <Skeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage your account details.</p>
      </div>
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Email</dt>
            <dd className="text-right">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Credits</dt>
            <dd>{user.creditBalance}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
