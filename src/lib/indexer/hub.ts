import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { getIndexerOrigin } from "@/lib/indexer/config";
import { prisma } from "@/lib/prisma";

/** Known search-engine crawlers only (not SEO audit tools). */
const BOT_UA =
  /googlebot|google-inspectiontool|bingbot|yandex|baiduspider|duckduckbot|slurp|naverbot|seznambot|petalbot|applebot|amazonbot/i;

export function generateHubToken(): string {
  return nanoid(16);
}

export function getHubUrl(hubToken: string): string {
  return `${getIndexerOrigin()}/r/${hubToken}`;
}

export function isSearchBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_UA.test(userAgent);
}

/** Record a search-bot visit to a hub page (discovery signal). */
export async function recordBotHit(hubToken: string, userAgent?: string | null) {
  if (!isSearchBotUserAgent(userAgent)) {
    return false;
  }

  const row = await prisma.taskUrl.findUnique({
    where: { hubToken },
    select: { id: true, status: true, botHitAt: true },
  });
  if (!row) return false;

  const now = new Date();
  const nextStatus =
    row.status === "pending" || row.status === "submitted" ? "discovered" : row.status;

  await prisma.taskUrl.update({
    where: { id: row.id },
    data: {
      botHitAt: row.botHitAt ?? now,
      botHitCount: { increment: 1 },
      status: nextStatus,
      updatedAt: now,
    },
  });

  return true;
}

/** Read User-Agent from the current request (server components / route handlers). */
export async function getRequestUserAgent(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent");
}
