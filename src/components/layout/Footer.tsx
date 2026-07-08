import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { APP_NAME } from "@/lib/brand";
import { COMPANY } from "@/lib/trust-content";
import { LANDING_PAGES } from "@/lib/landing-pages";

const FOOTER_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="site-footer border-t border-[var(--card-border)] py-12">
      <div className="site-container">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-2">
            <Logo variant="footer" linked />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              {COMPANY.tagline}. 1 credit per URL — honest pipeline tracking and automatic refunds on failed
              crawls.
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              <a href={`mailto:${COMPANY.email}`} className="text-link">
                {COMPANY.email}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[var(--text)]">Product</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]" aria-label="Product">
              <Link href="/features" className="no-underline hover:text-[var(--text)]">
                Features
              </Link>
              <Link href="/how-it-works" className="no-underline hover:text-[var(--text)]">
                How it works
              </Link>
              <Link href="/pricing" className="no-underline hover:text-[var(--text)]">
                Pricing
              </Link>
              <Link href="/blog" className="no-underline hover:text-[var(--text)]">
                Blog
              </Link>
              <Link href="/faq" className="no-underline hover:text-[var(--text)]">
                FAQ
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[var(--text)]">Company</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]" aria-label="Company">
              <Link href="/about" className="no-underline hover:text-[var(--text)]">
                About us
              </Link>
              <Link href="/case-studies" className="no-underline hover:text-[var(--text)]">
                Case studies
              </Link>
              <Link href="/contact" className="no-underline hover:text-[var(--text)]">
                Contact &amp; support
              </Link>
              <Link href="/security" className="no-underline hover:text-[var(--text)]">
                Security
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[var(--text)]">Solutions</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]" aria-label="Solutions">
              {LANDING_PAGES.map((page) => (
                <Link key={page.slug} href={`/${page.slug}`} className="no-underline hover:text-[var(--text)]">
                  {page.breadcrumbLabel}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[var(--text)]">Legal</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]" aria-label="Legal">
              <Link href="/privacy" className="no-underline hover:text-[var(--text)]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="no-underline hover:text-[var(--text)]">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="no-underline hover:text-[var(--text)]">
                Refund Policy
              </Link>
              <Link href="/register" className="no-underline hover:text-[var(--text)]">
                Sign up
              </Link>
              <Link href="/login" className="no-underline hover:text-[var(--text)]">
                Sign in
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--card-border)] pt-8 text-xs text-[var(--muted2)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {FOOTER_YEAR} {APP_NAME}. All rights reserved.
          </p>
          <p>
            {COMPANY.address.line2} · {COMPANY.address.line3}
          </p>
        </div>
      </div>
    </footer>
  );
}
