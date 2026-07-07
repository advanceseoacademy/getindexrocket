import { pingGoogleHubSitemap } from "@/lib/indexer/google-search-console";
import { APP_NAME } from "@/lib/brand";
import { getIndexerOrigin, HUB_FEED_LIMIT } from "@/lib/indexer/config";
import { getHubUrl } from "@/lib/indexer/hub";
import { prisma } from "@/lib/prisma";
import { isTerminalStatus } from "@/lib/indexing-status";

export type HubFeedEntry = {
  hubToken: string;
  targetUrl: string;
  updatedAt: Date;
};

export async function loadActiveHubEntries(limit = HUB_FEED_LIMIT): Promise<HubFeedEntry[]> {
  const rows = await prisma.taskUrl.findMany({
    where: {
      hubToken: { not: null },
      NOT: { status: { in: ["refunded", "failed"] } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      hubToken: true,
      url: true,
      updatedAt: true,
      status: true,
    },
  });

  return rows
    .filter((r) => r.hubToken && !isTerminalStatus(r.status))
    .map((r) => ({
      hubToken: r.hubToken!,
      targetUrl: r.url,
      updatedAt: r.updatedAt,
    }));
}

export function buildRssXml(entries: HubFeedEntry[]): string {
  const origin = getIndexerOrigin();
  const items = entries
    .map((entry) => {
      const hubUrl = getHubUrl(entry.hubToken);
      const pub = entry.updatedAt.toUTCString();
      return `    <item>
      <title>${escapeXml(entry.targetUrl)}</title>
      <link>${escapeXml(hubUrl)}</link>
      <guid isPermaLink="true">${escapeXml(hubUrl)}</guid>
      <pubDate>${pub}</pubDate>
      <description>Discovery hub for ${escapeXml(entry.targetUrl)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(APP_NAME)} Indexing Feed</title>
    <link>${escapeXml(origin)}</link>
    <description>Active backlink discovery hubs</description>
    <atom:link href="${escapeXml(`${origin}/feed/indexing.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function buildHubSitemapXml(entries: HubFeedEntry[]): string {
  const urls = entries
    .map((entry) => {
      const loc = getHubUrl(entry.hubToken);
      const lastmod = entry.updatedAt.toISOString();
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.3</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function pingDiscoveryEndpoints(): Promise<void> {
  const origin = getIndexerOrigin();
  const sitemapUrl = `${origin}/sitemap-hubs.xml`;
  const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

  await Promise.all([
    fetch(bingPingUrl, { method: "GET", cache: "no-store" }).catch(() => undefined),
    pingGoogleHubSitemap().catch(() => undefined),
  ]);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
