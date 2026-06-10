"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavLoggedInActions } from "@/components/layout/NavLoggedInActions";

export function NavAuthClient() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const authed = document.cookie.includes("gir_auth=1");
    setLoggedIn(authed);

    if (authed) {
      const cached = sessionStorage.getItem("gir_user_cache");
      if (cached) {
        try {
          const user = JSON.parse(cached) as { creditBalance?: number };
          if (user.creditBalance != null) setCredits(user.creditBalance);
        } catch {
          /* ignore */
        }
      }
      fetch("/api/account", { credentials: "same-origin" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user?.creditBalance != null) setCredits(data.user.creditBalance);
        })
        .catch(() => {});
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-[10px] bg-[var(--green)] px-4 py-2 text-sm font-semibold text-[#050f08] no-underline"
        >
          Get Started
        </Link>
      </div>
    );
  }

  if (loggedIn) {
    return <NavLoggedInActions creditBalance={credits} />;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-[10px] bg-[var(--green)] px-4 py-2 text-sm font-semibold text-[#050f08] no-underline"
      >
        Get Started
      </Link>
    </div>
  );
}
