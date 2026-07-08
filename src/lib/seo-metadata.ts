import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@/lib/brand";

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  keywords?: string[];
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  index = true,
  keywords,
  absoluteTitle = false,
}: PageSeoInput): Metadata {
  const canonical = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const resolvedTitle = absoluteTitle ? { absolute: title } : title;
  const ogTitle = absoluteTitle ? title : `${title} | ${APP_NAME}`;

  const metadata: Metadata = {
    title: resolvedTitle,
    description,
    alternates: { canonical },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false },
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url: canonical,
      siteName: APP_NAME,
      locale: "en_US",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${APP_NAME} preview` }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: ["/opengraph-image"],
    },
  };

  if (keywords?.length) {
    metadata.keywords = keywords;
  }

  return metadata;
}

export function buildPrivatePageMetadata(
  input: Omit<PageSeoInput, "index">,
): Metadata {
  return buildPageMetadata({ ...input, index: false });
}

export const DEFAULT_KEYWORDS = [
  "backlink indexing",
  "url indexing service",
  "google indexing tool",
  "guest post indexing",
  "link indexing",
  "seo indexing",
  "bulk url submission",
  "GetindexRocket",
  "getindexrocket",
];

export const SITE_METADATA: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Backlink Indexing Service | 1 Credit Per URL`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Submit backlinks and third-party URLs for search engine discovery. 1 credit per URL, live tracking, auto refund on crawl fail.",
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: APP_NAME,
    url: APP_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${APP_NAME} preview` }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "fy7PUVqJhXuUDkq9RgYkxyRs3TK5PQT03I3_UUE484I",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};
