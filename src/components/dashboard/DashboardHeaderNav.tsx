"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { prefetch } from "@/lib/client-cache";
import { navigateDashboard, type DashboardPath } from "@/lib/dashboard-nav";

export const DASHBOARD_NAV_LINKS = [
  { href: "/dashboard" as const, label: "Dashboard", prefetch: "/api/dashboard?skipSync=1" },
  { href: "/tasks" as const, label: "My Tasks", prefetch: "/api/tasks" },
  { href: "/billing" as const, label: "Buy Credits", prefetch: null },
  { href: "/settings" as const, label: "Settings", prefetch: null },
  { href: "/support" as const, label: "Support", prefetch: "/api/tickets" },
] as const;

function isDashboardPath(path: string): path is DashboardPath {
  return DASHBOARD_NAV_LINKS.some((link) => link.href === path);
}

export function DashboardHeaderNav() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    if (isDashboardPath(pathname)) setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    const onNav = (e: Event) => {
      setActivePath((e as CustomEvent<DashboardPath>).detail);
    };
    const onPop = () => {
      const path = window.location.pathname;
      if (isDashboardPath(path)) setActivePath(path);
    };
    window.addEventListener("gir:dashboard-nav", onNav);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("gir:dashboard-nav", onNav);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return (
    <nav className="hidden items-center gap-2 md:flex" aria-label="Dashboard navigation">
      <a
        href="/"
        className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] no-underline hover:text-[var(--text)]"
      >
        Home
      </a>
      {DASHBOARD_NAV_LINKS.map((link) => {
        const active = activePath === link.href;
        return (
          <button
            key={link.href}
            type="button"
            onMouseEnter={() => {
              if (link.prefetch) prefetch(link.prefetch);
            }}
            onClick={() => navigateDashboard(link.href)}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              active
                ? "bg-[var(--accent)] font-medium text-[var(--on-accent)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}
