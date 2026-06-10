"use client";

import type { DashboardPath } from "@/lib/dashboard-nav";
import { prefetch } from "@/lib/client-cache";

const LINKS = [
  { href: "/dashboard", label: "Overview", prefetch: "/api/dashboard" },
  { href: "/submit", label: "Submit URLs", prefetch: null },
  { href: "/tasks", label: "My Tasks", prefetch: "/api/tasks" },
  { href: "/billing", label: "Buy Credits", prefetch: null },
  { href: "/settings", label: "Settings", prefetch: null },
] as const;

type DashboardNavProps = {
  activePath: string;
  onNavigate: (href: DashboardPath) => void;
};

export function DashboardNav({ activePath, onNavigate }: DashboardNavProps) {
  async function logout() {
    sessionStorage.removeItem("gir_user_cache");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <nav className="flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <button
            key={link.href}
            type="button"
            onMouseEnter={() => {
              if (link.prefetch) prefetch(link.prefetch);
            }}
            onClick={() => onNavigate(link.href)}
            className={`rounded-lg px-4 py-2 text-sm ${
              activePath === link.href
                ? "bg-[var(--green)] font-medium text-[#050f08]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
      >
        Sign out
      </button>
    </div>
  );
}
