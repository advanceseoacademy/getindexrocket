import { Footer } from "@/components/layout/Footer";
import { HomeJsonLd } from "@/components/marketing/JsonLd";
import { Hero } from "@/components/marketing/Hero";
import { HomeSections } from "@/components/marketing/HomeSections";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  absoluteTitle: true,
  title: `${APP_NAME} — Backlink Indexing Service | 1 Credit Per URL`,
  description:
    "Submit guest posts, niche edits, and third-party backlinks for search engine discovery. 1 credit per URL, live pipeline tracking, auto refund if crawl fails.",
  path: "/",
  keywords: [
    "backlink indexing",
    "url indexing service",
    "google indexing tool",
    "guest post indexing",
    "link indexing",
    "bulk url submission",
    "seo indexing service",
    "getindexrocket",
  ],
});

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <Hero />
      <HomeSections />
      <Footer />
    </>
  );
}
