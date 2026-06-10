import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { NavGuestActions } from "@/components/layout/NavGuestActions";
import { NavLoggedInActions } from "@/components/layout/NavLoggedInActions";

type NavUser = {
  email: string;
  creditBalance: number;
};

type NavProps = {
  user?: NavUser | null;
};

export function Nav({ user = null }: NavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[rgba(10,13,18,0.85)] backdrop-blur-md">
      <div className="site-container flex items-center justify-between py-4">
        <Logo variant="nav" />

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
        </nav>

        {user ? (
          <NavLoggedInActions creditBalance={user.creditBalance} />
        ) : (
          <NavGuestActions />
        )}
      </div>
    </header>
  );
}
