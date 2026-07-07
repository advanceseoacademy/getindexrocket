import { getIndexerOrigin } from "@/lib/indexer/config";

const BING_SUBMIT_BATCH_URL =
  "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch";

export type BingWebmasterResult = {
  ok: boolean;
  submitted: number;
  skipped: boolean;
  error?: string;
};

function getBingWebmasterApiKey(): string | null {
  const key = process.env.BING_WEBMASTER_API_KEY?.trim();
  return key || null;
}

function getBingWebmasterSiteUrl(): string {
  const configured = process.env.BING_WEBMASTER_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return getIndexerOrigin();
}

/** Hub URLs on our verified domain → Bing Webmaster URL Submission API (batch). */
export async function submitHubUrlsToBingWebmaster(
  hubUrls: string[],
): Promise<BingWebmasterResult> {
  const apiKey = getBingWebmasterApiKey();
  if (!apiKey) {
    return { ok: true, submitted: 0, skipped: true };
  }

  if (hubUrls.length === 0) {
    return { ok: true, submitted: 0, skipped: false };
  }

  const siteUrl = getBingWebmasterSiteUrl();
  const siteHost = new URL(siteUrl).hostname.toLowerCase();
  const unique = [
    ...new Set(
      hubUrls.filter((url) => {
        try {
          return new URL(url).hostname.toLowerCase() === siteHost;
        } catch {
          return false;
        }
      }),
    ),
  ];

  if (unique.length === 0) {
    return {
      ok: false,
      submitted: 0,
      skipped: false,
      error: "No hub URLs match BING_WEBMASTER_SITE_URL host",
    };
  }

  const batchSize = 500;
  let submitted = 0;

  for (let i = 0; i < unique.length; i += batchSize) {
    const chunk = unique.slice(i, i + batchSize);
    const endpoint = `${BING_SUBMIT_BATCH_URL}?apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        siteUrl,
        urlList: chunk,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        submitted,
        skipped: false,
        error: text || `Bing Webmaster submit failed (${res.status})`,
      };
    }

    submitted += chunk.length;
  }

  return { ok: true, submitted, skipped: false };
}

export function isBingWebmasterEnabled(): boolean {
  return Boolean(getBingWebmasterApiKey());
}
