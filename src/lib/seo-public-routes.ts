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
  { path: "/features", changeFrequency: "monthly", priority: 0.85 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.85 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.85 },
  { path: "/register", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.4 },
];

/** Block private app & API routes from crawlers */
export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/dashboard",
  "/submit",
  "/tasks",
  "/billing",
  "/settings",
  "/support",
  "/admin",
  "/admin/login",
  "/feed/",
];
