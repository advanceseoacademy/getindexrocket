import { APP_NAME, APP_URL } from "@/lib/brand";

export function LegalPageJsonLd({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${APP_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: APP_URL },
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
