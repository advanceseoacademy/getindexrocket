"use client";

import { useEffect, useState } from "react";
import { BuyCredits } from "@/components/billing/BuyCredits";

function Skeleton() {
  return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-[var(--bg3)]" />;
}

export function BillingLoader() {
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

  return <BuyCredits userEmail={user.email} creditBalance={user.creditBalance} />;
}
