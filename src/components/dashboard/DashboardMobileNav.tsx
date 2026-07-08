"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { prefetch } from "@/lib/client-cache";
import { navigateDashboard, type DashboardPath } from "@/lib/dashboard-nav";

const LINKS = [
  { href: "/dashboard" as const, label: "Home", icon: "⌂" },
  { href: "/tasks" as const, label: "Tasks", icon: "☰", prefetch: "/api/tasks" },
  { href: "/billing" as const, label: "Credits", icon: "＋" },
  { href: "/support" as const, label: "Support", icon: "?" },
] as const;

function isDashboardPath(path: string): path is DashboardPath {
  return ["/dashboard", "/tasks", "/billing", "/settings", "/support"].includes(path);
}

export function DashboardMobileNav() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    if (isDashboardPath(pathname)) setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    const onNav = (e: Event) => setActivePath((e as CustomEvent<DashboardPath>).detail);
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
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--card-border)] bg-[rgba(10,13,18,0.95)] backdrop-blur-md md:hidden"
      aria-label="Dashboard mobile navigation"
    >
      <ul className="flex items-stretch justify-around px-1 py-1">
        {LINKS.map((link) => {
          const active = activePath === link.href;
          return (
            <li key={link.href} className="flex-1">
              <button
                type="button"
                onClick={() => {
                  if ("prefetch" in link && link.prefetch) prefetch(link.prefetch);
                  navigateDashboard(link.href);
                }}
                className={`flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium ${
                  active ? "text-[var(--green)]" : "text-[var(--muted)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-base leading-none" aria-hidden>
                  {link.icon}
                </span>
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
