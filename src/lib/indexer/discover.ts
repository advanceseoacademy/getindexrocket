import { submitHubUrlsToBingWebmaster, isBingWebmasterEnabled } from "@/lib/indexer/bing-webmaster";
import { submitHubUrlsToGoogleIndexing, isGoogleIndexingEnabled } from "@/lib/indexer/google-indexing";
import { getIndexNowKey } from "@/lib/indexer/config";
import { submitHubUrlsToIndexNow } from "@/lib/indexer/indexnow";

export type DiscoverySubmitResult = {
  ok: boolean;
  indexNowSubmitted: number;
  bingSubmitted: number;
  googleSubmitted: number;
  errors: string[];
};

/** Push hub URLs to search engines (IndexNow, Bing Webmaster, Google Indexing API). */
export async function submitHubUrlsForDiscovery(
  hubUrls: string[],
): Promise<DiscoverySubmitResult> {
  const errors: string[] = [];

  const [indexNow, bing, google] = await Promise.all([
    submitHubUrlsToIndexNow(hubUrls),
    submitHubUrlsToBingWebmaster(hubUrls),
    submitHubUrlsToGoogleIndexing(hubUrls),
  ]);

  if (!indexNow.ok && indexNow.error) errors.push(indexNow.error);
  if (!bing.skipped && !bing.ok && bing.error) errors.push(bing.error);
  if (!google.skipped && !google.ok && google.error) errors.push(google.error);

  const ok =
    errors.length === 0 ||
    indexNow.ok ||
    indexNow.submitted > 0 ||
    (!bing.skipped && (bing.ok || bing.submitted > 0)) ||
    (!google.skipped && (google.ok || google.submitted > 0));

  return {
    ok,
    indexNowSubmitted: indexNow.submitted,
    bingSubmitted: bing.submitted,
    googleSubmitted: google.submitted,
    errors,
  };
}

export function isDiscoveryConfigured(): boolean {
  return (
    Boolean(getIndexNowKey()) ||
    isBingWebmasterEnabled() ||
    isGoogleIndexingEnabled()
  );
}
