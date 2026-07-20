import { HomeJsonLd } from "@/components/marketing/JsonLd";
import { Hero } from "@/components/marketing/Hero";
import { HomeSections } from "@/components/marketing/HomeSections";
import { HomeSeoSection } from "@/components/marketing/HomeSeoSection";
import { LivePlatformStats } from "@/components/marketing/trust/LivePlatformStats";
import { APP_NAME, SIGNUP_BONUS_CREDITS } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  absoluteTitle: true,
  title: `${APP_NAME} — Backlink Indexing Service | 1 Credit Per URL`,
  description: `Submit guest posts, niche edits, and third-party backlinks for search engine discovery. Get ${SIGNUP_BONUS_CREDITS} free credits on signup, 1 credit per URL, live pipeline tracking, auto refund if crawl fails.`,
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
    "free indexing credits",
  ],
});

export default async function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <Hero />
      <LivePlatformStats />
      <HomeSections />
      <HomeSeoSection />
    </>
  );
}
