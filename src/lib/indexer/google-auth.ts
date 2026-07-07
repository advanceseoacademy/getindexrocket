import { GoogleAuth } from "google-auth-library";
import { getIndexerOrigin } from "@/lib/indexer/config";

const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
const WEBMASTERS_SCOPE = "https://www.googleapis.com/auth/webmasters";

function parseServiceAccountJson(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isGoogleIndexingEnabled(): boolean {
  return Boolean(parseServiceAccountJson());
}

export function getGoogleSearchConsoleSiteUrl(): string {
  const configured = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (configured) return configured.endsWith("/") ? configured : `${configured}/`;
  return `${getIndexerOrigin()}/`;
}

export async function getGoogleIndexerAuth(scopes: string[]): Promise<GoogleAuth | null> {
  const credentials = parseServiceAccountJson();
  if (!credentials) return null;

  return new GoogleAuth({ credentials, scopes });
}

export async function getGoogleAccessToken(scopes: string[]): Promise<string | null> {
  const auth = await getGoogleIndexerAuth(scopes);
  if (!auth) return null;

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token ?? null;
}

export function getGoogleIndexingScopes(): string[] {
  return [INDEXING_SCOPE];
}

export function getGoogleWebmastersScopes(): string[] {
  return [WEBMASTERS_SCOPE];
}
