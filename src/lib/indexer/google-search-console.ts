import {
  getGoogleAccessToken,
  getGoogleSearchConsoleSiteUrl,
  getGoogleWebmastersScopes,
  isGoogleIndexingEnabled,
} from "@/lib/indexer/google-auth";

export type GoogleSitemapPingResult = {
  ok: boolean;
  skipped: boolean;
  error?: string;
};

/** Notify Google Search Console that the hub sitemap was updated. */
export async function pingGoogleHubSitemap(): Promise<GoogleSitemapPingResult> {
  if (!isGoogleIndexingEnabled()) {
    return { ok: true, skipped: true };
  }

  const accessToken = await getGoogleAccessToken(getGoogleWebmastersScopes());
  if (!accessToken) {
    return { ok: false, skipped: false, error: "Google service account auth failed" };
  }

  const siteUrl = encodeURIComponent(getGoogleSearchConsoleSiteUrl());
  const feedPath = encodeURIComponent("sitemap-hubs.xml");
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${feedPath}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      skipped: false,
      error: text || `Google sitemap submit failed (${res.status})`,
    };
  }

  return { ok: true, skipped: false };
}
