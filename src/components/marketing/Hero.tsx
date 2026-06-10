import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { APP_NAME } from "@/lib/brand";

export function Hero() {
  return (
    <section className="site-container pt-10 pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="animate-hero-in mb-6 inline-flex items-center gap-2 rounded-3xl border border-[var(--accent-20)] bg-[var(--accent-08)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--green)]">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            Built for backlink &amp; third-party URL indexing
          </div>
          <h1 className="animate-hero-in-delay-1 leading-tight font-bold">
            <span className="gradient-text text-[clamp(34px,5vw,52px)]">{APP_NAME}</span>
            <span className="mt-2 block text-[clamp(20px,2.4vw,28px)] font-semibold text-[var(--text)]">
              Get your backlinks discovered faster
            </span>
          </h1>
          <p className="animate-hero-in-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)]">
            Submit guest posts, niche edits, and third-party URLs you don&apos;t own.
            Track honest pipeline status — no fake Googlebot tricks, no false guarantees.
            <strong className="font-medium text-[var(--text)]"> 1 credit = 1 URL.</strong>
          </p>
          <div className="animate-hero-in-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="btn-primary inline-flex rounded-[10px] bg-[var(--green)] px-6 py-3.5 text-[15px] font-semibold text-[var(--on-accent)] no-underline"
            >
              Get started →
            </Link>
            <Link
              href="/pricing"
              className="btn-ghost inline-flex rounded-[10px] border border-[var(--card-border)] px-6 py-3.5 text-[15px] text-[var(--muted)] no-underline hover:text-[var(--text)]"
            >
              View pricing
            </Link>
          </div>
          <div className="animate-hero-in-delay-3 mt-8 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            {["Auto credit refund", "1 credit per URL", "Live status tracking"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-lg border border-[var(--card-border)] px-3 py-1.5 transition-colors hover:border-[var(--accent-25)]"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        <AnimateIn variant="slide-right" delay={200} className="hidden lg:block">
          <div className="animate-float rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6">
            <div className="mb-4 flex items-center gap-2 text-xs">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              <span className="font-semibold text-[var(--green)]">LIVE</span>
              <span className="text-[var(--muted)]">— Pipeline status</span>
            </div>
            <div className="space-y-3">
              {[
                ["Submitted", "https://example.com/guest-post", "var(--accent)"],
                ["Processing", "https://example.com/niche-edit", "var(--blue)"],
                ["Crawled", "https://example.com/web2-blog", "var(--success)"],
                ["Refunded", "https://example.com/backlink", "var(--amber)"],
              ].map(([status, url, color], i) => (
                <div
                  key={url}
                  className="pipeline-row flex items-center justify-between gap-4 rounded-lg bg-[var(--bg4)] px-4 py-3 text-sm transition-colors hover:bg-[var(--bg3)]"
                  style={{ animationDelay: `${320 + i * 90}ms` }}
                >
                  <span className="truncate text-[var(--muted)]">{url}</span>
                  <span className="shrink-0 font-medium" style={{ color }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
