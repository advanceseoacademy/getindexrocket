import { HowItWorksPageContent } from "@/components/marketing/HowItWorksPageContent";
import { BreadcrumbJsonLd } from "@/components/marketing/JsonLd";
import { FaqPageJsonLd } from "@/components/marketing/FaqPageJsonLd";
import { APP_NAME } from "@/lib/brand";
import { BACKLINK_INDEXING_FAQ } from "@/lib/seo-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "How It Works — Backlink Indexing Pipeline",
  description: `Learn how ${APP_NAME} processes backlink URLs: submit, discovery signals, crawl verification, live status, and automatic credit refunds.`,
  path: "/how-it-works",
  keywords: [
    "how backlink indexing works",
    "url indexing process",
    "google indexing pipeline",
    "backlink discovery",
    "GetindexRocket how it works",
  ],
});

export default function HowItWorksPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ]}
      />
      <FaqPageJsonLd items={BACKLINK_INDEXING_FAQ} path="/how-it-works" />
      <HowItWorksPageContent />
    </>
  );
}
