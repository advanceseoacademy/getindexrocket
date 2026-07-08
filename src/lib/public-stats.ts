import { prisma } from "@/lib/prisma";

export type PublicStats = {
  updatedAt: string;
  urlsSubmitted: number | null;
  urlsCrawled: number | null;
  urlsRefunded: number | null;
  urlsProcessing: number | null;
  activeDiscoveryHubs: number | null;
  pipelineSignalsSent: number | null;
  registeredAccounts: number | null;
  crawlSuccessRate: number | null;
};

const EMPTY_STATS: PublicStats = {
  updatedAt: new Date().toISOString(),
  urlsSubmitted: null,
  urlsCrawled: null,
  urlsRefunded: null,
  urlsProcessing: null,
  activeDiscoveryHubs: null,
  pipelineSignalsSent: null,
  registeredAccounts: null,
  crawlSuccessRate: null,
};

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const [totalUrls, crawled, refunded, processing, activeHubs, signalsSent, accounts] =
      await Promise.all([
        prisma.taskUrl.count(),
        prisma.taskUrl.count({ where: { status: "crawled" } }),
        prisma.taskUrl.count({ where: { status: "refunded" } }),
        prisma.taskUrl.count({
          where: { status: { in: ["pending", "submitted", "discovered", "processing"] } },
        }),
        prisma.taskUrl.count({ where: { hubToken: { not: null } } }),
        prisma.taskUrl.count({ where: { indexNowAt: { not: null } } }),
        prisma.user.count(),
      ]);

    const verified = crawled + refunded;
    const crawlRate = verified > 0 ? Math.round((crawled / verified) * 100) : null;

    return {
      updatedAt: new Date().toISOString(),
      urlsSubmitted: totalUrls,
      urlsCrawled: crawled,
      urlsRefunded: refunded,
      urlsProcessing: processing,
      activeDiscoveryHubs: activeHubs,
      pipelineSignalsSent: signalsSent,
      registeredAccounts: accounts,
      crawlSuccessRate: crawlRate,
    };
  } catch {
    return EMPTY_STATS;
  }
}

export function formatPublicStat(value: number | null, suffix = ""): string {
  if (value === null) return "—";
  if (value >= 10000) return `${Math.floor(value / 1000)}k+${suffix}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k${suffix}`;
  return `${value.toLocaleString("en-US")}${suffix}`;
}
