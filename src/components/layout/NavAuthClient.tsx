"use client";

import { useEffect, useState } from "react";
import { clearAuthClientCache } from "@/lib/auth-client-cache";
import { NavGuestActions } from "@/components/layout/NavGuestActions";
import { NavLoggedInActions } from "@/components/layout/NavLoggedInActions";

type NavAuthClientProps = {
  serverUser?: { email: string; creditBalance: number } | null;
  isAdmin?: boolean;
};

type AuthState = "guest" | "authed";

function hasAuthCookie() {
  return document.cookie.includes("gir_auth=1");
}

function readUserCache(): { creditBalance: number; isAdmin: boolean } | null {
  try {
    const raw = sessionStorage.getItem("gir_user_cache");
    if (!raw) return null;
    const user = JSON.parse(raw) as { creditBalance?: number; isAdmin?: boolean };
    if (user.creditBalance == null) return null;
    return { creditBalance: user.creditBalance, isAdmin: user.isAdmin === true };
  } catch {
    return null;
  }
}

export function NavAuthClient({ serverUser = null, isAdmin = false }: NavAuthClientProps) {
  // Always match server HTML on first paint — resolve auth only after mount.
  const [state, setState] = useState<AuthState>("guest");
  const [credits, setCredits] = useState<number | null>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (serverUser) {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function resolveAuth() {
      if (!hasAuthCookie()) {
        clearAuthClientCache();
        if (!cancelled) {
          setState("guest");
          setReady(true);
        }
        return;
      }

      const cached = readUserCache();
      if (cached && !cancelled) {
        setCredits(cached.creditBalance);
        setAdmin(cached.isAdmin);
        setState("authed");
        setReady(true);
      }

      try {
        const res = await fetch("/api/account", { credentials: "same-origin" });
        if (!res.ok) {
          clearAuthClientCache();
          if (!cancelled) {
            setState("guest");
            setReady(true);
          }
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
        if (!cancelled && !cached) setState("guest");
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void resolveAuth();

    return () => {
      cancelled = true;
    };
  }, [serverUser]);

  if (serverUser) {
    return <NavLoggedInActions creditBalance={serverUser.creditBalance} isAdmin={isAdmin} />;
  }

  if (!ready || state === "guest") {
    return <NavGuestActions />;
  }

  return <NavLoggedInActions creditBalance={credits} isAdmin={admin} />;
}
