"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PricingPlanButtonProps = {
  planId: string;
  label: string;
};

export function PricingPlanButton({ planId, label }: PricingPlanButtonProps) {
  const [href, setHref] = useState(`/register?plan=${planId}`);

  useEffect(() => {
    if (document.cookie.includes("gir_session=")) {
      setHref(`/billing?plan=${planId}`);
    }
  }, [planId]);

  return (
    <Link
      href={href}
      className="mt-6 inline-flex w-full justify-center rounded-[10px] bg-[var(--green)] py-3 font-semibold text-[#050f08] no-underline"
    >
      {label}
    </Link>
  );
}
