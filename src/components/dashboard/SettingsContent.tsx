"use client";

import { useEffect, useState } from "react";

function Skeleton() {
  return <div className="mt-8 h-40 animate-pulse rounded-2xl bg-[var(--bg3)]" />;
}

export function SettingsContent() {
  const [user, setUser] = useState<{ email: string; creditBalance: number } | null>(null);

  useEffect(() => {
    fetch("/api/account", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  if (!user) return <Skeleton />;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Credits</dt>
            <dd>{user.creditBalance}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
