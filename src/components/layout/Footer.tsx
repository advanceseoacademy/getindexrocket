import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { APP_NAME } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] py-12">
      <div className="site-container">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="footer" linked={false} />
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              Backlink indexing, discovery signals, and honest pipeline analytics for SEO teams.
              1 credit per URL — no false promises.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Product</p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]" aria-label="Product">
              <Link href="/features" className="no-underline hover:text-[var(--text)]">
                Features
              </Link>
              <Link href="/how-it-works" className="no-underline hover:text-[var(--text)]">
                How it works
              </Link>
              <Link href="/pricing" className="no-underline hover:text-[var(--text)]">
                Pricing
              </Link>
              <Link href="/#faq" className="no-underline hover:text-[var(--text)]">
                FAQ
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold">Account & Legal</p>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]" aria-label="Legal">
              <Link href="/register" className="no-underline hover:text-[var(--text)]">
                Sign up
              </Link>
              <Link href="/login" className="no-underline hover:text-[var(--text)]">
                Sign in
              </Link>
              <Link href="/privacy" className="no-underline hover:text-[var(--text)]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="no-underline hover:text-[var(--text)]">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="no-underline hover:text-[var(--text)]">
                Refund Policy
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-10 text-xs text-[var(--muted2)]">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
