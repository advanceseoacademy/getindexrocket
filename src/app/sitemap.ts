import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/brand";
import { PUBLIC_SITEMAP_ROUTES } from "@/lib/seo-public-routes";

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_SITEMAP_ROUTES.map((route) => ({
    url: `${APP_URL}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
