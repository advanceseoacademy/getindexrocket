import { Footer } from "@/components/layout/Footer";
import { BreadcrumbJsonLd } from "@/components/marketing/JsonLd";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description: `Terms of service for using ${APP_NAME} backlink indexing platform.`,
  path: "/terms",
  index: true,
});

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ]}
      />
      <article className="site-container py-16">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">Last updated: June 2026</p>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Service description</h2>
          <p>
            {APP_NAME} provides a backlink URL indexing submission and tracking service. We process
            submitted URLs through our platform and display pipeline status. We do not guarantee
            search engine indexing.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Credits & billing</h2>
          <p>
            1 credit equals 1 URL submission. Credits are purchased via Buy Me a Coffee membership
            or top-up. Credits do not expire while your account is active. Refunds are issued
            automatically when crawl verification fails per our refund policy.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Acceptable use</h2>
          <p>
            You may only submit URLs you have the right to promote. Do not submit illegal content,
            malware, or URLs that violate search engine guidelines. Abuse may result in account
            suspension.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Limitation of liability</h2>
          <p>
            {APP_NAME} is provided &quot;as is.&quot; We are not liable for indexing outcomes,
            ranking changes, or indirect damages arising from use of the service.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Contact</h2>
          <p>
            Questions? Email{" "}
            <a href="mailto:support@getindexrocket.com" className="text-[var(--green)]">
              support@getindexrocket.com
            </a>
            .
          </p>
        </section>
      </article>
      <Footer />
    </>
  );
}
