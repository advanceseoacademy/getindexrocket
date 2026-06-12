import Link from "next/link";
import { AdminHeaderNav } from "@/components/admin/AdminHeaderNav";
import { DashboardHeaderNav } from "@/components/dashboard/DashboardHeaderNav";
import { Logo } from "@/components/layout/Logo";
import { NavAuthClient } from "@/components/layout/NavAuthClient";
import { NavGuestActions } from "@/components/layout/NavGuestActions";
import { NavLoggedInActions } from "@/components/layout/NavLoggedInActions";

type NavUser = {
  email: string;
  creditBalance: number;
};

type NavProps = {
  user?: NavUser | null;
  isAdmin?: boolean;
  showAdminNav?: boolean;
  showDashboardNav?: boolean;
};

export function Nav({
  user = null,
  isAdmin = false,
  showAdminNav = false,
  showDashboardNav = false,
}: NavProps) {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-[var(--card-border)] bg-[rgba(10,13,18,0.85)] backdrop-blur-md">
      <div className="site-container flex items-center justify-between gap-4 py-4">
        <Logo variant="nav" />

        {showAdminNav ? (
          <AdminHeaderNav />
        ) : showDashboardNav ? (
          <DashboardHeaderNav />
        ) : (
          <nav
            className="hidden items-center gap-6 text-base text-[var(--muted)] md:flex"
            aria-label="Main navigation"
          >
            <Link href="/" className="nav-link no-underline hover:text-[var(--text)]">
              Home
            </Link>
            <Link href="/features" className="nav-link no-underline hover:text-[var(--text)]">
              Features
            </Link>
            <Link href="/how-it-works" className="nav-link no-underline hover:text-[var(--text)]">
              How it works
            </Link>
            <Link href="/pricing" className="nav-link no-underline hover:text-[var(--text)]">
              Pricing
            </Link>
            <Link href="/blog" className="nav-link no-underline hover:text-[var(--text)]">
              Blog
            </Link>
          </nav>
        )}

        {showAdminNav ? (
          user ? (
            <NavLoggedInActions
              creditBalance={user.creditBalance}
              isAdmin={isAdmin}
              showAdminNav
            />
          ) : (
            <NavGuestActions />
          )
        ) : showDashboardNav ? (
          user ? (
            <NavLoggedInActions
              creditBalance={user.creditBalance}
              isAdmin={isAdmin}
              showDashboardNav
            />
          ) : (
            <NavGuestActions />
          )
        ) : (
          <NavAuthClient serverUser={user} isAdmin={isAdmin} />
        )}
      </div>
    </header>
  );
}
