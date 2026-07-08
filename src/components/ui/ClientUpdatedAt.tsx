"use client";

import { useEffect, useState } from "react";

type ClientUpdatedAtProps = {
  iso: string;
};

/** Renders a locale time only after mount to avoid SSR/client clock mismatches. */
export function ClientUpdatedAt({ iso }: ClientUpdatedAtProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(
      new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, [iso]);

  if (!label) return null;

  return <span className="ml-1 text-[var(--muted2)]">· Updated {label}</span>;
}
