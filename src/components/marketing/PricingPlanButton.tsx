"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

type PricingPlanButtonProps = {
  planId: string;
  label: string;
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

export function PricingPlanButton({ planId, label }: PricingPlanButtonProps) {
  const loggedIn = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => false);
  const href = loggedIn ? `/billing?plan=${planId}` : `/register?plan=${planId}`;

  return (
    <Link
      href={href}
      className="mt-6 inline-flex w-full justify-center rounded-[10px] bg-[var(--green)] py-3 font-semibold text-[var(--on-accent)] no-underline"
    >
      {label}
    </Link>
  );
}
