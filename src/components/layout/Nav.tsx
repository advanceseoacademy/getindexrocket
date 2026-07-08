import Link from "next/link";
import { AdminHeaderNav } from "@/components/admin/AdminHeaderNav";
import { DashboardHeaderNav } from "@/components/dashboard/DashboardHeaderNav";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavAuthClient } from "@/components/layout/NavAuthClient";
import { NavGuestActions } from "@/components/layout/NavGuestActions";
import { NavLoggedInActions } from "@/components/layout/NavLoggedInActions";
import { MARKETING_NAV_LINKS } from "@/lib/nav-links";

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
      <div className="site-container flex items-center justify-between gap-3 py-3 md:gap-4 md:py-4">
        <Logo variant="nav" />

        {showAdminNav ? (
          <AdminHeaderNav />
        ) : showDashboardNav ? (
          <DashboardHeaderNav />
        ) : (
          <nav
            className="hidden items-center gap-5 text-sm text-[var(--muted)] lg:flex lg:gap-6 lg:text-base"
            aria-label="Main navigation"
          >
            {MARKETING_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className="nav-link no-underline hover:text-[var(--text)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {showAdminNav ? (
            user ? (
              <NavLoggedInActions creditBalance={user.creditBalance} isAdmin={isAdmin} showAdminNav />
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
            <>
              <NavAuthClient serverUser={user} isAdmin={isAdmin} />
              <MobileNav />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
