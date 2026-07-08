import { APP_NAME, APP_URL } from "@/lib/brand";

export function LegalPageJsonLd({
  path,
  name,
  description,
  schemaType = "WebPage",
}: {
  path: string;
  name: string;
  description: string;
  schemaType?: "WebPage" | "PrivacyPolicy" | "TermsOfService";
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": schemaType,
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
