import { APP_URL } from "@/lib/brand";

/** Days before a non-crawled URL is refunded. */
export const REFUND_AFTER_DAYS = Number(process.env.INDEXER_REFUND_DAYS ?? 15);

/** Max URLs processed per cron run. */
export const RUN_BATCH_SIZE = Number(process.env.INDEXER_BATCH_SIZE ?? 100);

/** Max hub URLs included in RSS / hub sitemap. */
export const HUB_FEED_LIMIT = Number(process.env.INDEXER_FEED_LIMIT ?? 2000);

/** Origin used for hub pages and IndexNow host (defaults to app URL). */
export function getIndexerOrigin(): string {
  const raw = process.env.INDEXER_HUB_ORIGIN?.trim() || APP_URL;
  return raw.replace(/\/$/, "");
}

export function getIndexerHost(): string {
  return new URL(getIndexerOrigin()).hostname;
}

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && key.length >= 8 ? key : null;
}

export function getIndexNowKeyLocation(): string | null {
  const key = getIndexNowKey();
  if (!key) return null;
  // IndexNow: key at root covers all URLs on the host (hub pages are under /r/).
  return `${getIndexerOrigin()}/${key}.txt`;
}

export function getCronSecret(): string | null {
  const secret = process.env.CRON_SECRET?.trim();
  return secret || null;
}
