import { BreadcrumbJsonLd, PricingJsonLd } from "@/components/marketing/JsonLd";
import { FaqPageJsonLd } from "@/components/marketing/FaqPageJsonLd";
import { PricingPageContent } from "@/components/marketing/PricingPageContent";
import { PRICING_FAQ } from "@/lib/pricing-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Pricing — Backlink Indexing Credits",
  description:
    "Simple credit pricing: 1 credit = 1 URL. Starter $10 (50 credits), Pro $20 (110 credits), Agency $50 (270 credits). Auto-refund on crawl fail. Compare plans and calculate credits.",
  path: "/pricing",
  keywords: [
    "backlink indexing pricing",
    "url indexing cost",
    "seo indexing plans",
    "link indexing credits",
    "GetIndexRocket pricing",
    "credit calculator indexing",
  ],
});

export default function PricingPage() {
  return (
    <>
      <PricingJsonLd />
      <FaqPageJsonLd items={[...PRICING_FAQ]} path="/pricing" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <PricingPageContent />
    </>
  );
}
