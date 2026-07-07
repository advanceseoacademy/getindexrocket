import type { MetadataRoute } from "next";
import { getIndexerOrigin } from "@/lib/indexer/config";
import { ROBOTS_DISALLOW_PATHS } from "@/lib/seo-public-routes";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const origin = getIndexerOrigin();
  const isLocal = origin.includes("localhost");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ROBOTS_DISALLOW_PATHS,
    },
    sitemap: [`${origin}/sitemap.xml`, `${origin}/sitemap-hubs.xml`],
    host: isLocal ? undefined : origin,
  };
}