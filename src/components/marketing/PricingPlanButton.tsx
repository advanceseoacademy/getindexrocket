"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

type PricingPlanButtonProps = {
  planId: string;
  label: string;
  variant?: "primary" | "secondary";
};

function getSessionSnapshot() {
  return typeof document !== "undefined" && document.cookie.includes("gir_session=");
}

function subscribeSession(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onChange();
  window.addEventListener("focus", handler);
  return () => window.removeEventListener("focus", handler);
}

export function PricingPlanButton({ planId, label, variant = "primary" }: PricingPlanButtonProps) {
  const loggedIn = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => false);
  const href = loggedIn ? `/billing?plan=${planId}` : `/register?plan=${planId}`;

  const className =
    variant === "primary"
      ? "mt-6 inline-flex w-full justify-center rounded-[10px] bg-[var(--green)] py-3 font-semibold text-[var(--on-accent)] no-underline hover:opacity-95"
      : "mt-6 inline-flex w-full justify-center rounded-[10px] border border-[var(--card-border)] bg-[var(--bg2)] py-3 font-semibold text-[var(--text)] no-underline hover:border-[var(--green)]";

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
