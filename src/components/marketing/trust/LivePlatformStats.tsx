import { AnimateIn } from "@/components/ui/AnimateIn";
import { ClientUpdatedAt } from "@/components/ui/ClientUpdatedAt";
import { formatPublicStat, getPublicStats } from "@/lib/public-stats";

export async function LivePlatformStats() {
  const stats = await getPublicStats();
  const live = stats.urlsSubmitted !== null;

  const items = [
    { label: "URLs submitted", value: formatPublicStat(stats.urlsSubmitted) },
    { label: "Successfully crawled", value: formatPublicStat(stats.urlsCrawled) },
    { label: "Active discovery hubs", value: formatPublicStat(stats.activeDiscoveryHubs) },
    {
      label: "Crawl success rate",
      value: stats.crawlSuccessRate !== null ? `${stats.crawlSuccessRate}%` : "—",
    },
  ];

  return (
    <section
      className="section-pad-sm border-y border-[var(--card-border)] bg-[var(--bg2)]/60"
      aria-label="Platform statistics"
    >
      <div className="site-container">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Live platform stats</p>
            <p className="text-sm text-[var(--muted)]">
              Real-time aggregates from the indexing pipeline
              {live && stats.updatedAt ? <ClientUpdatedAt iso={stats.updatedAt} /> : null}
            </p>
          </div>
          {live && (
            <span className="pill">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              Live
            </span>
          )}
        </div>
        <div className="stat-grid mt-8 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {items.map((item, i) => (
            <AnimateIn key={item.label} delay={i * 50} variant="fade-in">
              <div className="text-center md:text-left">
                <p className="stat-value text-2xl font-bold tracking-tight text-[var(--green)] md:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1.5 text-xs text-[var(--muted)] md:text-sm">{item.label}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
