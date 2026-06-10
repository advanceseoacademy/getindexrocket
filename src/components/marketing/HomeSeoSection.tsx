import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { APP_NAME } from "@/lib/brand";

export function HomeSeoSection() {
  return (
    <section className="site-container py-12">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] px-6 py-10 md:px-10">
        <AnimateIn>
          <h2 className="text-2xl font-bold md:text-3xl">
            The backlink indexing service for SEO professionals
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
            <p>
              {APP_NAME} helps link builders, SEO agencies, and affiliate marketers get third-party
              backlinks discovered by search engines faster. Submit guest posts, niche edits,
              Web 2.0 links, and outreach placements — URLs on sites you do not own and cannot
              verify in Google Search Console.
            </p>
            <p>
              Our platform uses a structured discovery pipeline with live status tracking. Every
              URL shows a clear label: Submitted, Processing, Crawled, or Refunded. We do not
              promise guaranteed Google indexing — that would be dishonest. Instead, we show exactly
              what happened and automatically refund credits when crawl verification fails.
            </p>
            <p>
              Pricing is simple: <strong className="text-[var(--text)]">1 credit = 1 URL</strong>.
              Choose a monthly membership — Starter, Pro, or Agency — and submit URLs from your
              dashboard. Track campaigns, export CSV reports, and give clients transparent pipeline
              data they can trust.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/features" className="text-[var(--green)] no-underline hover:underline">
              All features →
            </Link>
            <Link href="/how-it-works" className="text-[var(--green)] no-underline hover:underline">
              How it works →
            </Link>
            <Link href="/pricing" className="text-[var(--green)] no-underline hover:underline">
              Pricing →
            </Link>
            <Link href="/refund-policy" className="text-[var(--green)] no-underline hover:underline">
              Refund policy →
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
