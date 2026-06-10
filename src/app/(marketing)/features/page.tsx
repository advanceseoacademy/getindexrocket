import { FeaturesPageContent } from "@/components/marketing/FeaturesPageContent";
import { BreadcrumbJsonLd, LegalPageJsonLd } from "@/components/marketing/JsonLd";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Features — Backlink Indexing Platform",
  description: `Explore ${APP_NAME} features: third-party URL submissions, live pipeline tracking, bulk paste, CSV export, and automatic credit refunds on crawl failure.`,
  path: "/features",
  keywords: [
    "backlink indexing features",
    "url indexing dashboard",
    "bulk url submission",
    "seo indexing tool",
    "guest post indexing",
    "GetindexRocket features",
  ],
});

export default function FeaturesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Features", path: "/features" },
        ]}
      />
      <LegalPageJsonLd
        path="/features"
        name={`${APP_NAME} Features`}
        description="Backlink indexing platform features for SEO teams — bulk submissions, pipeline tracking, and automatic refunds."
      />
      <FeaturesPageContent />
    </>
  );
}
