import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/brand";
import { ROBOTS_DISALLOW_PATHS } from "@/lib/seo-public-routes";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const isLocal = APP_URL.includes("localhost");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ROBOTS_DISALLOW_PATHS,
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: isLocal ? undefined : APP_URL,
  };
}
