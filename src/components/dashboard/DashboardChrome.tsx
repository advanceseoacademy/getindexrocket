"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Nav } from "@/components/layout/Nav";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { SubmitFormLoader } from "@/components/dashboard/SubmitFormLoader";
import { IndexingReport } from "@/components/dashboard/IndexingReport";
import { BillingLoader } from "@/components/billing/BillingLoader";
import { SettingsContent } from "@/components/dashboard/SettingsContent";
import { useUser } from "@/components/dashboard/UserProvider";
import { prefetch } from "@/lib/client-cache";

import type { DashboardPath } from "@/lib/dashboard-nav";
import { navigateDashboard } from "@/lib/dashboard-nav";

const DASHBOARD_PATHS: DashboardPath[] = [
  "/dashboard",
  "/submit",
  "/tasks",
  "/billing",
  "/settings",
];

const VIEW: Record<DashboardPath, () => ReactNode> = {
  "/dashboard": () => <DashboardHome />,
  "/submit": () => <SubmitFormLoader />,
  "/tasks": () => <IndexingReport />,
  "/billing": () => <BillingLoader />,
  "/settings": () => <SettingsContent />,
};

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

  const initialPath = isDashboardPath(routerPathname) ? routerPathname : "/dashboard";
  const [activePath, setActivePath] = useState<DashboardPath>(initialPath);
  const [mounted, setMounted] = useState<Set<DashboardPath>>(() => new Set([initialPath]));

  const navigateInstant = useCallback((href: DashboardPath) => {
    setActivePath(href);
    setMounted((prev) => new Set(prev).add(href));
    navigateDashboard(href);
    if (href === "/dashboard") prefetch("/api/dashboard");
    if (href === "/tasks") prefetch("/api/tasks?skipSync=1");
  }, []);

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
    if (isDashboardPath(routerPathname)) {
      setActivePath(routerPathname);
      setMounted((prev) => new Set(prev).add(routerPathname));
    }
  }, [routerPathname]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (isDashboardPath(path)) setActivePath(path);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    prefetch("/api/dashboard");
    prefetch("/api/tasks?skipSync=1");
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading && !user) {
    return (
      <>
        <Nav />
        <main className="site-container flex-1 py-10">
          <ShellSkeleton />
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Nav user={user} />
      <main
        id="main-content"
        className="site-container flex-1 py-10"
      >
        <DashboardNav activePath={activePath} onNavigate={navigateInstant} />
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
    </>
  );
}
