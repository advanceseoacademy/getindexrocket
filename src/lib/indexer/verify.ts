/**
 * Smart verification — checks if the target backlink appears in Google (preferred) or Bing.
 *
 * Google: GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX (Programmable Search Engine, search the web)
 * Bing:   BING_SEARCH_API_KEY (Azure Bing Web Search v7)
 */

export type VerifyResult = {
  indexed: boolean;
  skipped: boolean;
  engine?: "google" | "bing";
  error?: string;
};

function getBingApiKey(): string | null {
  const key = process.env.BING_SEARCH_API_KEY?.trim();
  return key || null;
}

function getGoogleCseConfig(): { apiKey: string; cx: string } | null {
  const apiKey = process.env.GOOGLE_CSE_API_KEY?.trim();
  const cx = process.env.GOOGLE_CSE_CX?.trim();
  if (!apiKey || !cx) return null;
  return { apiKey, cx };
}

function normalizeForCompare(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    const path = u.pathname.replace(/\/$/, "") || "/";
    return `${u.protocol}//${u.hostname.toLowerCase()}${path}${u.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

async function verifyViaGoogle(targetUrl: string): Promise<VerifyResult> {
  const config = getGoogleCseConfig();
  if (!config) {
    return { indexed: false, skipped: true };
  }

  try {
    const query = encodeURIComponent(`"${targetUrl}"`);
    const endpoint = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(config.apiKey)}&cx=${encodeURIComponent(config.cx)}&q=${query}&num=3`;
    const res = await fetch(endpoint, { cache: "no-store" });

    if (!res.ok) {
      return {
        indexed: false,
        skipped: false,
        engine: "google",
        error: `Google verify failed (${res.status})`,
      };
    }

    const data = (await res.json()) as {
      items?: { link?: string }[];
    };

    const normalizedTarget = normalizeForCompare(targetUrl);
    const indexed = (data.items ?? []).some((item) => {
      if (!item.link) return false;
      return normalizeForCompare(item.link) === normalizedTarget;
    });

    return { indexed, skipped: false, engine: "google" };
  } catch (err) {
    return {
      indexed: false,
      skipped: false,
      engine: "google",
      error: err instanceof Error ? err.message : "Google verify error",
    };
  }
}

async function verifyViaBing(targetUrl: string): Promise<VerifyResult> {
  const apiKey = getBingApiKey();
  if (!apiKey) {
    return { indexed: false, skipped: true };
  }

  try {
    const query = encodeURIComponent(`"${targetUrl}"`);
    const endpoint = `https://api.bing.microsoft.com/v7.0/search?q=${query}&count=3`;
    const res = await fetch(endpoint, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        indexed: false,
        skipped: false,
        engine: "bing",
        error: `Bing verify failed (${res.status})`,
      };
    }

    const data = (await res.json()) as {
      webPages?: { value?: { url?: string }[] };
    };

    const hits = data.webPages?.value ?? [];
    const normalizedTarget = normalizeForCompare(targetUrl);
    const indexed = hits.some((hit) => {
      if (!hit.url) return false;
      return normalizeForCompare(hit.url) === normalizedTarget;
    });

    return { indexed, skipped: false, engine: "bing" };
  } catch (err) {
    return {
      indexed: false,
      skipped: false,
      engine: "bing",
      error: err instanceof Error ? err.message : "Bing verify error",
    };
  }
}

export async function verifyUrlIndexed(targetUrl: string): Promise<VerifyResult> {
  const google = await verifyViaGoogle(targetUrl);
  if (!google.skipped) return google;

  return verifyViaBing(targetUrl);
}

export function isGoogleVerificationEnabled(): boolean {
  return Boolean(getGoogleCseConfig());
}

export function isBingVerificationEnabled(): boolean {
  return Boolean(getBingApiKey());
}

export function isVerificationEnabled(): boolean {
  return isGoogleVerificationEnabled() || isBingVerificationEnabled();
}

/** Per-task: only verify when user paid for smart verification and an API is configured. */
export function shouldVerifyForTask(smartVerification: boolean): boolean {
  return smartVerification && isVerificationEnabled();
}
