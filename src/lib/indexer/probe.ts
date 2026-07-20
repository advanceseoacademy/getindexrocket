import { submitHubUrlsToBingWebmaster } from "@/lib/indexer/bing-webmaster";
import { getIndexerOrigin, getIndexNowKey } from "@/lib/indexer/config";
import { submitHubUrlsToGoogleIndexing } from "@/lib/indexer/google-indexing";
import { submitHubUrlsToIndexNow } from "@/lib/indexer/indexnow";

export type ChannelProbe = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  serviceAccount?: string;
};

export type DiscoveryProbeResult = {
  indexNow: ChannelProbe;
  bing: ChannelProbe;
  google: ChannelProbe;
};

function getServiceAccountEmail(): string | null {
  try {
    const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { client_email?: string };
    return parsed.client_email ?? null;
  } catch {
    return null;
  }
}

/** Live one-URL probe of IndexNow / Bing / Google discovery channels. */
export async function probeDiscoveryChannels(): Promise<DiscoveryProbeResult> {
  const probeUrl = `${getIndexerOrigin()}/`;
  const key = getIndexNowKey();

  const [indexNow, bing, google] = await Promise.all([
    key
      ? submitHubUrlsToIndexNow([probeUrl])
      : Promise.resolve({ ok: false, submitted: 0, error: "INDEXNOW_KEY missing" }),
    submitHubUrlsToBingWebmaster([probeUrl]),
    submitHubUrlsToGoogleIndexing([probeUrl]),
  ]);

  return {
    indexNow: {
      ok: indexNow.ok,
      error: indexNow.error,
    },
    bing: {
      ok: bing.ok,
      skipped: bing.skipped,
      error: bing.error,
    },
    google: {
      ok: google.ok,
      skipped: google.skipped,
      error: google.error,
      serviceAccount: getServiceAccountEmail() ?? undefined,
    },
  };
}
