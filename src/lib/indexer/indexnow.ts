import {
  getIndexNowKey,
  getIndexNowKeyLocation,
  getIndexerHost,
} from "@/lib/indexer/config";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = {
  ok: boolean;
  submitted: number;
  error?: string;
};

export async function submitHubUrlsToIndexNow(hubUrls: string[]): Promise<IndexNowResult> {
  const key = getIndexNowKey();
  const keyLocation = getIndexNowKeyLocation();
  if (!key || !keyLocation) {
    return { ok: false, submitted: 0, error: "INDEXNOW_KEY is not configured" };
  }

  if (hubUrls.length === 0) {
    return { ok: true, submitted: 0 };
  }

  const host = getIndexerHost();
  const unique = [...new Set(hubUrls)];

  // IndexNow allows up to 10,000 URLs per request; batch conservatively.
  const batchSize = 500;
  let submitted = 0;

  for (let i = 0; i < unique.length; i += batchSize) {
    const chunk = unique.slice(i, i + batchSize);
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: chunk,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        submitted,
        error: text || `IndexNow error (${res.status})`,
      };
    }

    submitted += chunk.length;
  }

  return { ok: true, submitted };
}
