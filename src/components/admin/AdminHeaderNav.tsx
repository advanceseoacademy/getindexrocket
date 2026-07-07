"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users", exact: false },
  { href: "/admin/payments", label: "Payments", exact: false },
  { href: "/admin/tasks", label: "Tasks", exact: false },
  { href: "/admin/tickets", label: "Tickets", exact: false },
  { href: "/admin/credits", label: "Credits", exact: false },
  { href: "/admin/posts", label: "Blog", exact: false },
] as const;

export function AdminHeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 md:flex" aria-label="Admin navigation">
      {ADMIN_NAV_LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm no-underline ${
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
  );
}
