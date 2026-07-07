import { NextResponse } from "next/server";
import { APP_SLUG } from "@/lib/brand";
import { getIndexerStatus } from "@/lib/indexer/status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const includeIndexer = new URL(request.url).searchParams.get("indexer") === "1";

  try {
    await prisma.$queryRaw`SELECT 1`;
    const body: Record<string, unknown> = {
      status: "ok",
      service: APP_SLUG,
      database: "connected",
    };

    if (includeIndexer) {
      body.indexer = getIndexerStatus();
    }

    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { status: "degraded", service: APP_SLUG, database: "disconnected" },
      { status: 503 },
    );
  }
}
