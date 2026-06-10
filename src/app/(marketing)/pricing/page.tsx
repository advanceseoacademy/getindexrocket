import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { BreadcrumbJsonLd, PricingJsonLd } from "@/components/marketing/JsonLd";
import { FaqPageJsonLd } from "@/components/marketing/FaqPageJsonLd";
import { PricingCards } from "@/components/marketing/PricingCards";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

const PRICING_FAQ = [
  {
    q: "How much does each URL cost?",
    a: "1 credit = 1 URL. Starter gives 50 credits ($10), Pro gives 110 credits ($20), and Agency gives 270 credits ($50) per month.",
  },
  {
    q: "Do credits expire?",
    a: "Credits stay on your account while it is active. If your membership lapses, unused credits may be forfeited per our Terms of Service.",
  },
  {
    q: "What happens if a URL fails?",
    a: "If crawl verification fails, the URL is marked Refunded and your credit is returned automatically. See our refund policy for details.",
  },
  {
    q: "Can I submit bulk URLs?",
    a: "Yes. Paste up to 10,000 URLs per batch from your dashboard. Each valid HTTP/HTTPS URL costs 1 credit.",
  },
];

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Pricing — Backlink Indexing Credits",
  description:
    "Simple credit pricing: 1 credit = 1 URL. Starter $10 (50 credits), Pro $20 (110 credits), Agency $50 (270 credits). Credits stay on your account while active.",
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
      <FaqPageJsonLd items={PRICING_FAQ} path="/pricing" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <section className="site-container py-16">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          1 credit = 1 URL. Credits stay on your account while it is active. Cancel membership
          anytime.
        </p>
        <div className="mt-10">
          <PricingCards />
        </div>

        <AnimateIn className="mt-16 max-w-2xl">
          <h2 className="text-xl font-bold">Why {APP_NAME} pricing is simple</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            No per-seat fees, no hidden API charges, no confusing tier limits. You buy credits,
            submit backlink URLs, and track honest pipeline status. Every plan includes the same
            core features — bulk submission, live tracking, CSV export, and automatic refunds when
            crawl verification fails.
          </p>
        </AnimateIn>

        <section className="mt-12 max-w-2xl">
          <AnimateIn>
            <h2 className="text-xl font-bold">Pricing FAQ</h2>
          </AnimateIn>
          <div className="mt-6 space-y-4">
            {PRICING_FAQ.map((item, i) => (
              <AnimateIn key={item.q} delay={i * 40}>
                <details className="faq-item rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-5">
                  <summary className="cursor-pointer font-medium">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
                </details>
              </AnimateIn>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            <Link href="/refund-policy" className="text-[var(--green)] no-underline hover:underline">
              Refund policy
            </Link>
            {" · "}
            <Link href="/how-it-works" className="text-[var(--green)] no-underline hover:underline">
              How it works
            </Link>
          </p>
        </section>
      </section>
    </>
  );
}
