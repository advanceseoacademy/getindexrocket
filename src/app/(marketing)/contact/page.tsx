import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { APP_NAME } from "@/lib/brand";
import { COMPANY, SUPPORT_CHANNELS } from "@/lib/trust-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Contact & Support",
  description: `Contact ${APP_NAME} — email support, business inquiries, and help resources. support@getindexrocket.com`,
  path: "/contact",
  keywords: ["contact getindexrocket", "support", "help", "business inquiries"],
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      <LegalPageJsonLd
        path="/contact"
        name="Contact & Support"
        description={`Contact and support information for ${APP_NAME}.`}
      />
      <article className="site-container section-pad">
        <header className="max-w-3xl">
          <AnimateIn>
            <p className="eyebrow">Contact</p>
            <h1 className="text-display">Contact &amp; support</h1>
            <p className="text-lead mt-5">
              We&apos;re here to help with account questions, billing, and technical support. Reach out by email or
              open a ticket from your dashboard.
            </p>
          </AnimateIn>
        </header>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {SUPPORT_CHANNELS.map((channel, i) => (
            <AnimateIn key={channel.title} delay={i * 50}>
              <div className="ui-card hover-lift h-full">
                <h2 className="font-semibold">{channel.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{channel.desc}</p>
                <Link href={channel.href} className="text-link mt-4 inline-flex text-sm font-medium">
                  {channel.action} →
                </Link>
              </div>
            </AnimateIn>
          ))}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-2">
          <AnimateIn>
            <div className="ui-card ui-card-muted h-full">
              <h2 className="section-title text-xl">Company information</h2>
              <address className="mt-5 space-y-2 text-sm not-italic leading-relaxed text-[var(--muted)]">
                <p className="font-semibold text-[var(--text)]">{COMPANY.address.line1}</p>
                <p>{COMPANY.address.line2}</p>
                <p>{COMPANY.address.line3}</p>
                <p className="pt-3">
                  <span className="text-[var(--muted2)]">Email: </span>
                  <a href={`mailto:${COMPANY.email}`} className="text-link">
                    {COMPANY.email}
                  </a>
                </p>
                <p>
                  <span className="text-[var(--muted2)]">Web: </span>
                  <a href={COMPANY.website} className="text-link">
                    {COMPANY.website.replace(/^https?:\/\//, "")}
                  </a>
                </p>
                <p className="pt-2 text-xs text-[var(--muted2)]">Founded {COMPANY.founded}</p>
              </address>
            </div>
          </AnimateIn>

          <AnimateIn delay={60}>
            <div className="ui-card h-full">
              <h2 className="section-title text-xl">Support hours &amp; response</h2>
              <ul className="mt-5 space-y-3 text-sm text-[var(--muted)]">
                <li className="flex items-start gap-2.5">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  Email support: typically within 24–48 business hours
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  Dashboard tickets: for signed-in users with active accounts
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  Refund &amp; billing: see{" "}
                  <Link href="/refund-policy" className="text-link">
                    refund policy
                  </Link>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  Security reports:{" "}
                  <Link href="/security" className="text-link">
                    security page
                  </Link>
                </li>
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={`mailto:${COMPANY.email}`}>Email support</ButtonLink>
                <ButtonLink href="/login" variant="ghost">
                  Sign in for tickets
                </ButtonLink>
              </div>
            </div>
          </AnimateIn>
        </section>

        <section className="mt-12 flex flex-wrap gap-4 text-sm">
          <Link href="/about" className="text-link">
            About {APP_NAME}
          </Link>
          <Link href="/faq" className="text-link">
            FAQ
          </Link>
          <Link href="/privacy" className="text-link">
            Privacy Policy
          </Link>
          <Link href="/refund-policy" className="text-link">
            Refund Policy
          </Link>
        </section>
      </article>
    </>
  );
}
