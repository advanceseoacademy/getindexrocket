import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { APP_NAME } from "@/lib/brand";
import { SECURITY_POINTS } from "@/lib/trust-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Security — Data Protection & Platform Safety",
  description: `How ${APP_NAME} protects your account, URLs, and payment data. Encryption, secure sessions, and infrastructure practices.`,
  path: "/security",
  keywords: ["getindexrocket security", "data protection", "secure indexing platform"],
});

export default function SecurityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Security", path: "/security" },
        ]}
      />
      <LegalPageJsonLd
        path="/security"
        name="Security"
        description={`Security practices and data protection at ${APP_NAME}.`}
      />
      <article className="site-container section-pad">
        <header className="max-w-3xl">
          <AnimateIn>
            <p className="eyebrow">Security</p>
            <h1 className="text-display">Security at {APP_NAME}</h1>
            <p className="text-lead mt-5">
              We take the security of your account, submitted URLs, and billing information seriously. This page
              outlines how we protect your data across the platform.
            </p>
          </AnimateIn>
        </header>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_POINTS.map((point, i) => (
            <AnimateIn key={point.title} delay={i * 50}>
              <div className="ui-card hover-lift h-full">
                <span className="icon-box icon-box-blue" aria-hidden>
                  <Icon name="shield" size={20} />
                </span>
                <h2 className="mt-4 font-semibold">{point.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{point.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>

        <section className="mt-16 max-w-3xl space-y-6 text-sm leading-relaxed text-[var(--muted)]">
          <AnimateIn>
            <h2 className="section-title text-xl text-[var(--text)]">Reporting security issues</h2>
            <p className="mt-4">
              If you discover a security vulnerability, please report it responsibly to{" "}
              <a href="mailto:support@getindexrocket.com" className="text-link">
                support@getindexrocket.com
              </a>
              . Do not disclose publicly until we have had a chance to investigate.
            </p>
          </AnimateIn>
          <AnimateIn delay={40}>
            <h2 className="section-title text-xl text-[var(--text)]">Related policies</h2>
            <ul className="mt-4 flex flex-wrap gap-4">
              <li>
                <Link href="/privacy" className="text-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-link">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </AnimateIn>
        </section>
      </article>
    </>
  );
}
