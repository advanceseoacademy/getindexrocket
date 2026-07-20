import { NextResponse } from "next/server";
import { getIndexerStatus } from "@/lib/indexer/status";
import { probeDiscoveryChannels } from "@/lib/indexer/probe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const status = getIndexerStatus();
  const url = new URL(request.url);
  const shouldProbe = url.searchParams.get("probe") === "1";

  const [pendingUrls, activeHubs, submittedUrls, crawledUrls, botHitUrls] =
    await Promise.all([
      prisma.taskUrl.count({
        where: { status: { in: ["pending", "submitted", "discovered", "processing"] } },
      }),
      prisma.taskUrl.count({ where: { hubToken: { not: null } } }),
      prisma.taskUrl.count({ where: { indexNowAt: { not: null } } }),
      prisma.taskUrl.count({ where: { status: "crawled" } }),
      prisma.taskUrl.count({ where: { botHitAt: { not: null } } }),
    ]);

  const probes = shouldProbe ? await probeDiscoveryChannels() : null;

  const channelOk = probes
    ? {
        indexNow: probes.indexNow.ok,
        bing: probes.bing.skipped || probes.bing.ok,
        google: probes.google.skipped || probes.google.ok,
      }
    : null;

  const ready =
    status.ready &&
    (!channelOk || (channelOk.indexNow && (channelOk.bing || channelOk.google)));

  return NextResponse.json({
    status: ready ? "ok" : "degraded",
    indexer: status,
    queue: {
      pendingUrls,
      activeHubs,
      submittedUrls,
      crawledUrls,
      botHitUrls,
    },
    probes,
    fixHints: probes
      ? [
          !probes.bing.skipped && !probes.bing.ok
            ? "Bing Webmaster API key is invalid — generate a new key in Bing Webmaster Tools → Settings → API Access, then update BING_WEBMASTER_API_KEY."
            : null,
          !probes.google.skipped && !probes.google.ok
            ? `Google Indexing API ownership failed — in Search Console for getindexrocket.com, add the service account as Owner: ${probes.google.serviceAccount ?? "(see GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON client_email)"}.`
            : null,
          !probes.indexNow.ok
            ? "IndexNow keyfile or API failed — confirm INDEXNOW_KEY and https://getindexrocket.com/{key}.txt are reachable."
            : null,
        ].filter(Boolean)
      : undefined,
  });
}
