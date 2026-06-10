"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users", exact: false },
  { href: "/admin/payments", label: "Payments", exact: false },
  { href: "/admin/tasks", label: "Tasks", exact: false },
  { href: "/admin/credits", label: "Credits", exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg bg-[var(--accent-15)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          Admin
        </span>
        <nav className="flex flex-wrap gap-2">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm no-underline ${
                  active
                    ? "bg-[var(--accent)] font-medium text-[var(--on-accent)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Link
        href="/dashboard"
        className="text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
      >
        ← User dashboard
      </Link>
    </div>
  );
}
