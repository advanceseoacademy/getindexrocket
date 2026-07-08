"use client";

import { useEffect, useState } from "react";
import { BuyCredits } from "@/components/billing/BuyCredits";
import { fetchCached, peekCached } from "@/lib/client-cache";

type AccountUser = { email: string; creditBalance: number };
type AccountResponse = { user: AccountUser };

const ACCOUNT_URL = "/api/account";

function Skeleton() {
  return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-[var(--bg3)]" />;
}

export function BillingLoader() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cached = peekCached<AccountResponse>(ACCOUNT_URL)?.user;
    if (cached) setUser(cached);

    fetchCached<AccountResponse>(ACCOUNT_URL, 60_000)
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setError("Could not load billing information.");
      })
      .catch(() => setError("Could not load billing information."));
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
    <div>
      <h1 className="text-2xl font-bold md:text-3xl">Billing</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Purchase credits and manage your membership plan.</p>
      <BuyCredits userEmail={user.email} creditBalance={user.creditBalance} />
    </div>
  );
}
