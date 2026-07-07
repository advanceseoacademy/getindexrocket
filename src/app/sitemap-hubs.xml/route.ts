import { buildHubSitemapXml, loadActiveHubEntries } from "@/lib/indexer/feeds";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const entries = await loadActiveHubEntries();
  const xml = buildHubSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
