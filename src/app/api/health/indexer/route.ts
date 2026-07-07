import { NextResponse } from "next/server";
import { getIndexerStatus } from "@/lib/indexer/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getIndexerStatus();

  const [pendingUrls, activeHubs, submittedUrls] = await Promise.all([
    prisma.taskUrl.count({
      where: { status: { in: ["pending", "submitted", "discovered", "processing"] } },
    }),
    prisma.taskUrl.count({ where: { hubToken: { not: null } } }),
    prisma.taskUrl.count({ where: { indexNowAt: { not: null } } }),
  ]);

  return NextResponse.json({
    status: status.ready ? "ok" : "degraded",
    indexer: status,
    queue: { pendingUrls, activeHubs, submittedUrls },
  });
}
