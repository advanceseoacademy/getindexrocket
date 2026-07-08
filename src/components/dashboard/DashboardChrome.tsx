"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { IndexingReport } from "@/components/dashboard/IndexingReport";
import { BillingLoader } from "@/components/billing/BillingLoader";
import { SettingsContent } from "@/components/dashboard/SettingsContent";
import { SupportContent } from "@/components/dashboard/SupportContent";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { useUser } from "@/components/dashboard/UserProvider";
import { prefetch } from "@/lib/client-cache";

import type { DashboardPath } from "@/lib/dashboard-nav";

const DASHBOARD_PATHS: DashboardPath[] = [
  "/dashboard",
  "/tasks",
  "/billing",
  "/settings",
  "/support",
];

const VIEW: Record<DashboardPath, () => ReactNode> = {
  "/dashboard": () => <DashboardHome />,
  "/tasks": () => <IndexingReport />,
  "/billing": () => <BillingLoader />,
  "/settings": () => <SettingsContent />,
  "/support": () => <SupportContent />,
};

function resolveDashboardPath(path: string): DashboardPath {
  if (path === "/submit") return "/dashboard";
  return DASHBOARD_PATHS.includes(path as DashboardPath) ? (path as DashboardPath) : "/dashboard";
}

function isDashboardPath(path: string): path is DashboardPath {
  return DASHBOARD_PATHS.includes(path as DashboardPath);
}

function ShellSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="h-8 w-40 rounded-lg bg-[var(--bg3)]" />
        <div className="h-10 w-48 rounded-xl bg-[var(--bg3)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg3)]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[520px] rounded-2xl bg-[var(--bg3)] lg:col-span-2" />
        <div className="h-80 rounded-2xl bg-[var(--bg3)]" />
      </div>
    </div>
  );
}

export function DashboardChrome() {
  const router = useRouter();
  const routerPathname = usePathname();
  const { user, loading } = useUser();

  const initialPath = resolveDashboardPath(routerPathname);
  const [activePath, setActivePath] = useState<DashboardPath>(initialPath);
  const [mounted, setMounted] = useState<Set<DashboardPath>>(() => new Set(DASHBOARD_PATHS));

  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<DashboardPath>).detail;
      setActivePath(path);
      setMounted((prev) => new Set(prev).add(path));
    };
    window.addEventListener("gir:dashboard-nav", handler);
    return () => window.removeEventListener("gir:dashboard-nav", handler);
  }, []);

  useEffect(() => {
    if (routerPathname === "/submit") {
      router.replace("/dashboard");
      return;
    }
    if (isDashboardPath(routerPathname)) {
      setActivePath(routerPathname);
      setMounted((prev) => new Set(prev).add(routerPathname));
    }
  }, [routerPathname, router]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path === "/submit") {
        window.history.replaceState(null, "", "/dashboard");
        setActivePath("/dashboard");
        return;
      }
      if (isDashboardPath(path)) {
        setActivePath(path);
        setMounted((prev) => new Set(prev).add(path));
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    prefetch("/api/dashboard?skipSync=1");
    prefetch("/api/tasks?skipSync=1");
    prefetch("/api/account");
    prefetch("/api/tickets");
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading && !user) {
    return (
      <>
        <Nav showDashboardNav />
        <main className="site-container flex-1 py-10">
          <ShellSkeleton />
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Nav user={user} showDashboardNav />
      <main
        id="main-content"
        className="site-container flex-1 py-10 pb-24 md:pb-10"
      >
        {Array.from(mounted).map((path) => {
          const View = VIEW[path];
          const hidden = path !== activePath;
          return (
            <div key={path} hidden={hidden} aria-hidden={hidden}>
              <View />
            </div>
          );
        })}
      </main>
      <DashboardMobileNav />
    </>
  );
}
