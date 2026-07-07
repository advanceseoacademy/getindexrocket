import { getIndexerOrigin } from "@/lib/indexer/config";
import {
  getGoogleAccessToken,
  getGoogleIndexingScopes,
  isGoogleIndexingEnabled,
} from "@/lib/indexer/google-auth";

const INDEXING_PUBLISH_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

export type GoogleIndexingResult = {
  ok: boolean;
  submitted: number;
  skipped: boolean;
  error?: string;
};

function filterOwnedHubUrls(hubUrls: string[]): string[] {
  const siteHost = new URL(getIndexerOrigin()).hostname.toLowerCase();
  return [
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
}

/** Hub URLs on our verified domain → Google Indexing API (URL_UPDATED). */
export async function submitHubUrlsToGoogleIndexing(
  hubUrls: string[],
): Promise<GoogleIndexingResult> {
  if (!isGoogleIndexingEnabled()) {
    return { ok: true, submitted: 0, skipped: true };
  }

  if (hubUrls.length === 0) {
    return { ok: true, submitted: 0, skipped: false };
  }

  const unique = filterOwnedHubUrls(hubUrls);
  if (unique.length === 0) {
    return {
      ok: false,
      submitted: 0,
      skipped: false,
      error: "No hub URLs match indexer origin host",
    };
  }

  const accessToken = await getGoogleAccessToken(getGoogleIndexingScopes());
  if (!accessToken) {
    return {
      ok: false,
      submitted: 0,
      skipped: false,
      error: "Google service account auth failed",
    };
  }

  let submitted = 0;
  let lastError: string | undefined;

  for (const url of unique) {
    const res = await fetch(INDEXING_PUBLISH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
      cache: "no-store",
    });

    if (res.ok) {
      submitted += 1;
      continue;
    }

    const text = await res.text().catch(() => "");
    lastError = text || `Google Indexing API failed (${res.status})`;
  }

  if (submitted === 0 && lastError) {
    return { ok: false, submitted: 0, skipped: false, error: lastError };
  }

  return { ok: true, submitted, skipped: false, error: lastError };
}

export { isGoogleIndexingEnabled };
