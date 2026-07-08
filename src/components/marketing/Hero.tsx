import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { APP_NAME } from "@/lib/brand";
import { TRUST_STATS } from "@/lib/home-content";

const PIPELINE_ROWS = [
  ["Submitted", "https://example.com/guest-post", "var(--accent)"],
  ["Processing", "https://example.com/niche-edit", "var(--blue)"],
  ["Crawled", "https://example.com/web2-blog", "var(--success)"],
  ["Refunded", "https://example.com/backlink", "var(--amber)"],
] as const;

const TRUST_BULLETS = ["No GSC required", "Bulk up to 10K URLs", "Credits refunded on fail"] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, var(--blue-15), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, var(--accent-08), transparent)",
        }}
      />

      <div className="site-container pb-14 pt-12 md:pb-24 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="max-w-xl">
            <div className="animate-hero-in pill mb-6">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              Backlink indexing for URLs you don&apos;t own
            </div>

            <h1 id="hero-heading" className="animate-hero-in-delay-1 text-display">
              Get third-party backlinks{" "}
              <span className="gradient-text">discovered by Google</span> — faster
            </h1>

            <p className="animate-hero-in-delay-2 text-lead mt-6">
              Submit guest posts, niche edits, and outreach links without Search Console access.
              {APP_NAME} sends real discovery signals and shows exactly what happened —{" "}
              <strong className="font-semibold text-[var(--text)]">1 credit = 1 URL</strong>, auto-refund
              if crawl fails.
            </p>

            <div className="animate-hero-in-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/register" size="lg">
                Start indexing — free account
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="ghost" size="lg">
                See how it works
              </ButtonLink>
            </div>

            <ul className="animate-hero-in-delay-3 mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {TRUST_BULLETS.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Icon name="check" size={16} className="shrink-0 text-[var(--green)]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-hero-in-delay-2 lg:pl-2 xl:pl-6">
            <div
              className="ui-card ui-card-muted hero-pipeline-card p-5 md:p-6"
              role="img"
              aria-label="Live pipeline preview showing URL statuses"
            >
              <div className="mb-5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                  <span className="font-semibold text-[var(--green)]">LIVE</span>
                  <span className="text-[var(--muted)]">Pipeline</span>
                </div>
                <span className="rounded-md bg-[var(--bg4)] px-2.5 py-1 text-[var(--muted)]">My Tasks</span>
              </div>
              <div className="space-y-2.5">
                {PIPELINE_ROWS.map(([status, url, color], i) => (
                  <div
                    key={url}
                    className="pipeline-row flex items-center justify-between gap-3 rounded-lg bg-[var(--bg4)] px-3 py-2.5 text-sm transition-colors hover:bg-[var(--bg3)] md:px-4 md:py-3"
                    style={{ animationDelay: `${320 + i * 90}ms` }}
                  >
                    <span className="min-w-0 truncate text-[var(--muted)]">{url}</span>
                    <span className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold md:text-sm" style={{ color }}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-[var(--card-border)] pt-12 md:grid-cols-4 md:gap-10">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="stat-value text-2xl font-bold tracking-tight text-[var(--green)] md:text-[1.75rem]">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-[var(--muted)] md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
