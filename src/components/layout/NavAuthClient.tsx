"use client";

import { useEffect, useState } from "react";
import { clearAuthClientCache } from "@/lib/auth-client-cache";
import { NavGuestActions } from "@/components/layout/NavGuestActions";
import { NavLoggedInActions } from "@/components/layout/NavLoggedInActions";

type NavAuthClientProps = {
  serverUser?: { email: string; creditBalance: number } | null;
  isAdmin?: boolean;
};

type AuthState = "checking" | "guest" | "authed";

function hasAuthCookie() {
  return typeof document !== "undefined" && document.cookie.includes("gir_auth=1");
}

function readCreditsFromCache() {
  try {
    const raw = sessionStorage.getItem("gir_user_cache");
    if (!raw) return null;
    const user = JSON.parse(raw) as { creditBalance?: number };
    return user.creditBalance ?? null;
  } catch {
    return null;
  }
}

function NavActionsSkeleton() {
  return (
    <div className="nav-actions flex min-h-10 min-w-[11.5rem] shrink-0 items-center justify-end gap-3 sm:min-w-[17rem]">
      <span className="hidden h-4 w-20 animate-pulse rounded bg-[var(--bg3)] sm:inline" />
      <span className="h-9 w-28 animate-pulse rounded-[10px] bg-[var(--bg3)]" />
    </div>
  );
}

export function NavAuthClient({ serverUser = null, isAdmin = false }: NavAuthClientProps) {
  const [state, setState] = useState<AuthState>("checking");
  const [credits, setCredits] = useState<number | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (serverUser) return;

    let cancelled = false;

    async function resolveAuth() {
      if (!hasAuthCookie()) {
        clearAuthClientCache();
        if (!cancelled) setState("guest");
        return;
      }

      const cachedCredits = readCreditsFromCache();
      if (cachedCredits != null && !cancelled) {
        setCredits(cachedCredits);
        setState("authed");
      }

      try {
        const res = await fetch("/api/account", { credentials: "same-origin" });
        if (!res.ok) {
          clearAuthClientCache();
          if (!cancelled) setState("guest");
          return;
        }
        const data = await res.json();
        if (!cancelled && data?.user) {
          setCredits(data.user.creditBalance ?? null);
          setAdmin(data.user.isAdmin === true);
          setState("authed");
          sessionStorage.setItem("gir_user_cache", JSON.stringify(data.user));
        } else if (!cancelled) {
          clearAuthClientCache();
          setState("guest");
        }
      } catch {
        if (!cancelled) {
          setAdmin(false);
          setState(cachedCredits != null ? "authed" : "guest");
        }
      }
    }

    resolveAuth();
    return () => {
      cancelled = true;
    };
  }, [serverUser]);

  if (serverUser) {
    return (
      <NavLoggedInActions
        creditBalance={serverUser.creditBalance}
        isAdmin={isAdmin}
      />
    );
  }

  if (state === "authed") {
    return <NavLoggedInActions creditBalance={credits} isAdmin={admin} />;
  }

  if (state === "checking") {
    return <NavActionsSkeleton />;
  }

  return <NavGuestActions />;
}
