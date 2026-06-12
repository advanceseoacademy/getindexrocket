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
    <div className="nav-actions flex min-h-10 min-w-[11.5rem] shrink-0 items-center justify-end gap-3 sm:min-w-[17rem]">
      {creditBalance != null && (
        <span className="hidden text-base text-[var(--muted)] sm:inline">
          {creditBalance} credits
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
