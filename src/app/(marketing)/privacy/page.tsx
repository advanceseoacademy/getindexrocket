import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${APP_NAME} — how we collect, use, and protect your data.`,
  path: "/privacy",
  index: true,
});

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ]}
      />
      <article className="site-container py-16 prose prose-invert">
        <h1 className="text-3xl font-bold text-[var(--text)]">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">Last updated: June 2026</p>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="text-lg font-semibold text-[var(--text)]">Information we collect</h2>
          <p>
            When you create an account, we collect your email address, name (optional), and
            password (stored securely hashed). When you submit URLs, we store those URLs and
            related indexing status for your dashboard.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">How we use your data</h2>
          <p>
            We use your information to provide the indexing service, process payments via third-party
            providers (Buy Me a Coffee), send service-related communications, and improve our
            platform.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Third-party services</h2>
          <p>
            We use Supabase for database hosting and Buy Me a Coffee for payments. URL indexing
            is processed through our platform infrastructure. These services process data according
            to their own privacy policies.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Data retention</h2>
          <p>
            Account data is retained while your account is active. You may request deletion by
            contacting support@getindexrocket.com.
          </p>

          <h2 className="text-lg font-semibold text-[var(--text)]">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:support@getindexrocket.com" className="text-[var(--green)]">
              support@getindexrocket.com
            </a>
            .
          </p>
        </section>
      </article>
    </>
  );
}
