import { FAQ_ITEMS } from "@/components/marketing/faq-data";
import { APP_NAME, APP_URL } from "@/lib/brand";
import { CREDIT_PLANS } from "@/lib/pricing-plans";

export { BreadcrumbJsonLd } from "./BreadcrumbJsonLd";
export { LegalPageJsonLd } from "./LegalPageJsonLd";

export function HomeJsonLd() {
  const organization = {
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    name: APP_NAME,
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    description:
      "Backlink indexing platform for guest posts, niche edits, and third-party URLs. 1 credit per URL with automatic credit refund on crawl failure.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@getindexrocket.com",
      availableLanguage: "English",
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${APP_URL}/#website`,
    name: APP_NAME,
    url: APP_URL,
    publisher: { "@id": `${APP_URL}/#organization` },
    inLanguage: "en-US",
  };

  const software = {
    "@type": "SoftwareApplication",
    "@id": `${APP_URL}/#software`,
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: APP_URL,
    description:
      "Backlink indexing platform for guest posts, niche edits, and third-party URLs. 1 credit per URL with live pipeline tracking.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "10",
      highPrice: "50",
      priceCurrency: "USD",
      offerCount: CREDIT_PLANS.filter((p) => p.priceUsd > 0).length,
    },
    publisher: { "@id": `${APP_URL}/#organization` },
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${APP_URL}/#webpage`,
    url: APP_URL,
    name: `${APP_NAME} — Backlink Indexing Service`,
    description:
      "Get backlinks discovered faster. Submit URLs you don't own, track indexing status, 1 credit per URL.",
    isPartOf: { "@id": `${APP_URL}/#website` },
    about: { "@id": `${APP_URL}/#software` },
    inLanguage: "en-US",
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${APP_URL}/#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, website, software, webPage, faqPage],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export function PricingJsonLd() {
  const offers = CREDIT_PLANS.filter((p) => p.priceUsd > 0).map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} Plan`,
    price: String(plan.priceUsd),
    priceCurrency: "USD",
    description: `${plan.credits} credits per month — ${plan.maxLinks} URLs`,
    url: `${APP_URL}/pricing#${plan.id}`,
    availability: "https://schema.org/InStock",
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${APP_NAME} Credit Plans`,
    description: "Monthly membership credits for backlink URL indexing. 1 credit = 1 URL.",
    brand: { "@type": "Brand", name: APP_NAME },
    url: `${APP_URL}/pricing`,
    offers,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

