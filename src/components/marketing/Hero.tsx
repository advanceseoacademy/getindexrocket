import Link from "next/link";

export function Hero() {
  return (
    <section className="site-container pt-10 pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-3xl border border-[rgba(34,211,122,0.2)] bg-[rgba(34,211,122,0.08)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--green)]">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            Built for backlink &amp; third-party URL indexing
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] leading-tight font-bold">
            Get your backlinks discovered
            <br />
            <span className="gradient-text">faster by search engines</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)]">
            Submit guest posts, niche edits, and third-party URLs you don&apos;t own.
            Track honest pipeline status — no fake Googlebot tricks, no false guarantees.
            <strong className="font-medium text-[var(--text)]"> 1 credit = 1 URL.</strong>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex rounded-[10px] bg-[var(--green)] px-6 py-3.5 text-[15px] font-semibold text-[#050f08] no-underline"
            >
              Get started →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-[10px] border border-[var(--card-border)] px-6 py-3.5 text-[15px] text-[var(--muted)] no-underline hover:text-[var(--text)]"
            >
              View pricing
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            {["98%+ success rate", "1 credit per URL", "Auto refund on crawl fail"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-lg border border-[var(--card-border)] px-3 py-1.5"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="hidden rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6 lg:block">
          <div className="mb-4 flex items-center gap-2 text-xs">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            <span className="font-semibold text-[var(--green)]">LIVE</span>
            <span className="text-[var(--muted)]">— Pipeline status</span>
          </div>
          <div className="space-y-3">
            {[
              ["Submitted", "https://example.com/guest-post", "var(--green)"],
              ["Discovered", "https://example.com/niche-edit", "var(--blue)"],
              ["Indexed", "https://example.com/web2-blog", "var(--green)"],
              ["Pending", "https://example.com/backlink", "var(--amber)"],
            ].map(([status, url, color]) => (
              <div
                key={url}
                className="flex items-center justify-between gap-4 rounded-lg bg-[var(--bg4)] px-4 py-3 text-sm"
              >
                <span className="truncate text-[var(--muted)]">{url}</span>
                <span className="shrink-0 font-medium" style={{ color: `var(${color})` }}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
