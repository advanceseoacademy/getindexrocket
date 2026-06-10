import { Footer } from "@/components/layout/Footer";
import { BreadcrumbJsonLd, PricingJsonLd } from "@/components/marketing/JsonLd";
import { PricingCards } from "@/components/marketing/PricingCards";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Pricing — Backlink Indexing Credits",
  description:
    "Simple credit pricing: 1 credit = 1 URL. Starter $10 (50 credits), Pro $20 (110 credits), Agency $50 (270 credits). Credits never expire.",
  path: "/pricing",
  keywords: [
    "backlink indexing pricing",
    "url indexing cost",
    "seo indexing plans",
    "link indexing credits",
    "GetindexRocket pricing",
  ],
});

export default function PricingPage() {
  return (
    <>
      <PricingJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <section className="site-container py-16">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          1 credit = 1 URL. Credits never expire. Cancel membership anytime.
        </p>
        <div className="mt-10">
          <PricingCards />
        </div>
      </section>
      <Footer />
    </>
  );
}
