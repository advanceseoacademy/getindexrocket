"use client";

import Link from "next/link";
import { clearAuthClientCache } from "@/lib/auth-client-cache";

type NavLoggedInActionsProps = {
  creditBalance?: number | null;
  isAdmin?: boolean;
  showAdminNav?: boolean;
  showDashboardNav?: boolean;
};

export function NavLoggedInActions({
  creditBalance,
  isAdmin = false,
  showAdminNav = false,
  showDashboardNav = false,
}: NavLoggedInActionsProps) {
  async function logout() {
    clearAuthClientCache();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="nav-actions flex min-h-10 shrink-0 items-center justify-end gap-2 sm:gap-3">
      {creditBalance != null && (
        <span className="rounded-full border border-[var(--card-border)] bg-[var(--bg2)] px-2.5 py-1 text-xs font-medium tabular-nums text-[var(--muted)] sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-base">
          {creditBalance} cr
        </span>
      )}
      {isAdmin && showAdminNav ? (
        <Link
          href="/dashboard"
          className="text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
        >
          ← User dashboard
        </Link>
      ) : showDashboardNav ? null : isAdmin ? (
        <Link
          href="/admin"
          className="rounded-[10px] bg-[var(--green)] px-4 py-2 text-base font-semibold text-[var(--on-accent)] no-underline"
        >
          Admin Dashboard
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="rounded-[10px] bg-[var(--green)] px-4 py-2 text-base font-semibold text-[var(--on-accent)] no-underline"
        >
          Dashboard
        </Link>
      )}
      <button
        type="button"
        onClick={logout}
        className="text-base text-[var(--muted)] hover:text-[var(--text)]"
      >
        Logout
      </button>
    </div>
  );
}
