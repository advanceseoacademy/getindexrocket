import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/indexer/config";
import { pingDiscoveryEndpoints } from "@/lib/indexer/feeds";

function authorize(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pingDiscoveryEndpoints();
    return NextResponse.json({ ok: true, pinged: ["bing-sitemap", "google-sitemap"] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Feed ping failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
