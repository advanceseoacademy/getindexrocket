import { getIndexNowKey } from "@/lib/indexer/config";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ keyfile: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const { keyfile } = await params;
  const key = getIndexNowKey();
  if (!key || keyfile !== `${key}.txt`) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
