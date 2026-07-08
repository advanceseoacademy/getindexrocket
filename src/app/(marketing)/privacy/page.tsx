import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";
import { APP_NAME } from "@/lib/brand";
import { COMPANY } from "@/lib/trust-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${APP_NAME} — how we collect, use, store, and protect your data.`,
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
      <LegalPageJsonLd
        path="/privacy"
        name="Privacy Policy"
        description={`Privacy policy for ${APP_NAME}.`}
        schemaType="PrivacyPolicy"
      />
      <article className="site-container section-pad max-w-3xl">
        <h1 className="text-display text-3xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">Last updated: June 2026</p>

        <section className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--muted)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Overview</h2>
            <p className="mt-3">
              {APP_NAME} ({COMPANY.website}) provides a backlink indexing service. This policy explains what data we
              collect, how we use it, and your rights regarding your personal information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Information we collect</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>Account data: email address, optional name, and securely hashed password</li>
              <li>OAuth data: if you sign in with Google, we receive your email and profile identifier</li>
              <li>Submitted URLs: backlink URLs you submit and their indexing pipeline status</li>
              <li>Payment metadata: membership status via Buy Me a Coffee (we do not store card numbers)</li>
              <li>Technical logs: IP address, browser type, and usage data for security and debugging</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">How we use your data</h2>
            <p className="mt-3">
              We use your information to provide the indexing service, authenticate your account, process credits,
              send service-related communications, prevent abuse, and improve the platform. We do not sell your
              personal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Third-party services</h2>
            <p className="mt-3">
              We use Supabase for database hosting, Buy Me a Coffee for payments, and Google for optional OAuth
              sign-in. URL indexing is processed through our platform infrastructure. These providers process data
              according to their own privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Data security</h2>
            <p className="mt-3">
              We use HTTPS encryption, hashed passwords, and secure session cookies. See our{" "}
              <Link href="/security" className="text-link">
                Security page
              </Link>{" "}
              for more details on how we protect your data.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Data retention &amp; deletion</h2>
            <p className="mt-3">
              Account data is retained while your account is active. You may request account deletion and data
              removal by emailing{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-link">
                {COMPANY.email}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Your rights</h2>
            <p className="mt-3">
              Depending on your location, you may have rights to access, correct, or delete your personal data. Contact
              us to exercise these rights.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Contact</h2>
            <p className="mt-3">
              Questions about this policy? Email{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-link">
                {COMPANY.email}
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="text-link">
                contact page
              </Link>
              .
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
