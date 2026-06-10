"use client";

import { useEffect, useState } from "react";
import { SubmitForm } from "./SubmitForm";

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-14 rounded-xl bg-[var(--bg3)]" />
      <div className="h-52 rounded-[10px] bg-[var(--bg3)]" />
      <div className="h-12 rounded-[10px] bg-[var(--bg3)]" />
    </div>
  );
}

export function SubmitFormLoader() {
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/account", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.creditBalance != null) {
          setCreditBalance(data.user.creditBalance);
        }
      })
      .catch(() => {});
  }, []);

  if (creditBalance === null) return <FormSkeleton />;

  return <SubmitForm creditBalance={creditBalance} />;
}
