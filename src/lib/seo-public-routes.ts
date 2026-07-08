import type { MetadataRoute } from "next";
import { LANDING_SLUGS } from "@/lib/landing-pages";

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
  { path: "/faq", changeFrequency: "monthly", priority: 0.75 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/case-studies", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.65 },
  { path: "/security", changeFrequency: "yearly", priority: 0.5 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.85 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.4 },
  ...LANDING_SLUGS.map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
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
