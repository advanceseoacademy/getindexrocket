import { APP_NAME, APP_URL } from "@/lib/brand";

type FaqItem = { q: string; a: string };

export function FaqPageJsonLd({ items, path }: { items: FaqItem[]; path: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${APP_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: APP_URL },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
