"use client";

import Link from "next/link";

type NavLoggedInActionsProps = {
  creditBalance?: number | null;
};

export function NavLoggedInActions({ creditBalance }: NavLoggedInActionsProps) {
  async function logout() {
    sessionStorage.removeItem("gir_user_cache");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="flex items-center gap-3">
      {creditBalance != null && (
        <span className="hidden text-sm text-[var(--muted)] sm:inline">
          {creditBalance} credits
        </span>
      )}
      <Link
        href="/dashboard"
        className="rounded-[10px] bg-[var(--green)] px-4 py-2 text-sm font-semibold text-[#050f08] no-underline"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={logout}
        className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
      >
        Logout
      </button>
    </div>
  );
}
