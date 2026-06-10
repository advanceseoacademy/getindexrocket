import type { MetadataRoute } from "next";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export type PublicRoute = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

/** Public marketing pages in sitemap.xml */
export const PUBLIC_SITEMAP_ROUTES: PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/register", changeFrequency: "monthly", priority: 0.8 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

/** Block private app & API routes from crawlers */
export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/dashboard",
  "/submit",
  "/tasks",
  "/billing",
  "/settings",
];
