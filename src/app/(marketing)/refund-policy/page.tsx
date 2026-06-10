import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Refund Policy",
  description: `Credit refund policy for ${APP_NAME}. Automatic credit return when backlink crawl verification fails.`,
  path: "/refund-policy",
  index: true,
  keywords: ["refund policy", "credit refund", "backlink indexing refund", "crawl fail refund"],
});

export default function RefundPolicyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Refund Policy", path: "/refund-policy" },
        ]}
      />
      <LegalPageJsonLd
        path="/refund-policy"
        name="Refund Policy"
        description={`Automatic credit refund policy when backlink URLs fail crawl verification on ${APP_NAME}.`}
      />
      <article className="site-container py-16">
        <h1 className="text-3xl font-bold">Refund Policy</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">Last updated: June 2026</p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--muted)]">
          <div className="rounded-xl border border-[var(--accent-25)] bg-[var(--accent-08)] px-5 py-4">
            <p className="font-medium text-[var(--green)]">Simple rule</p>
            <p className="mt-2 text-[var(--text)]">
              If your submitted backlink URL <strong>fails crawl verification</strong> and is marked{" "}
              <strong>Refunded</strong> in your dashboard, your credit is{" "}
              <strong>automatically returned</strong> to your account — no support ticket required.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">When you get a credit refund</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>
                You submit a URL and 1 credit is deducted (1 credit = 1 URL).
              </li>
              <li>
                Our system processes the URL through the indexing pipeline and verifies the host is
                reachable.
              </li>
              <li>
                If crawl verification fails within the processing window, the URL status becomes{" "}
                <strong>Refunded</strong>.
              </li>
              <li>
                When status changes to Refunded, <strong>1 credit is automatically added back</strong>{" "}
                to your balance.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">When a refund does not apply</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>
                <strong>No indexing guarantee:</strong> We do not refund credits simply because Google
                has not indexed a URL. Refunds apply when crawl verification fails, not when search
                engines choose not to index.
              </li>
              <li>
                <strong>Successful crawl:</strong> URLs marked <strong>Crawled</strong> used their
                credit as intended — no refund.
              </li>
              <li>
                <strong>Invalid submissions:</strong> Malformed URLs or policy violations may fail
                without refund.
              </li>
              <li>
                <strong>Immediate submission errors:</strong> If our indexing service rejects a batch
                at submit time, the full batch credit cost is refunded immediately.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">How to check refund status</h2>
            <p className="mt-3">
              Open <strong>My Tasks</strong> in your dashboard. Each URL shows its live status:
              Submitted, Processing, Crawled, or Refunded. Refunded URLs trigger an automatic credit
              return. Your updated balance appears on the dashboard and in your credit transaction
              history (type: <em>refund</em>).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Membership & purchases</h2>
            <p className="mt-3">
              This policy covers <strong>credit usage</strong> for URL submissions. Buy Me a Coffee
              membership payments follow Buy Me a Coffee&apos;s own refund terms. Contact us if a
              payment was charged incorrectly.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Questions</h2>
            <p className="mt-3">
              Email{" "}
              <a href="mailto:support@getindexrocket.com" className="text-[var(--green)]">
                support@getindexrocket.com
              </a>{" "}
              if a URL shows Refunded but your credit balance did not update within a few minutes.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
