import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { FounderSection } from "@/components/marketing/trust/FounderSection";
import { TestimonialsGrid } from "@/components/marketing/trust/TestimonialsGrid";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { APP_NAME } from "@/lib/brand";
import { COMPANY, TRUST_BADGES } from "@/lib/trust-content";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "About Us — Backlink Indexing Company",
  description: `Learn about ${APP_NAME} — our mission, founder, and commitment to honest backlink indexing for SEO teams worldwide.`,
  path: "/about",
  keywords: ["about getindexrocket", "backlink indexing company", "seo indexing team"],
});

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      <LegalPageJsonLd
        path="/about"
        name={`About ${APP_NAME}`}
        description={COMPANY.mission}
      />
      <article className="site-container section-pad">
        <header className="max-w-3xl">
          <AnimateIn>
            <p className="eyebrow">About</p>
            <h1 className="text-display">About {APP_NAME}</h1>
            <p className="text-lead mt-5">{COMPANY.mission}</p>
          </AnimateIn>
        </header>

        <section className="mt-16 max-w-3xl space-y-6">
          <AnimateIn>
            <h2 className="section-title text-xl">Our story</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              {APP_NAME} was founded in {COMPANY.founded} to solve a problem every link builder faces: third-party
              backlinks on sites you don&apos;t own are hard to get crawled, and most indexing tools hide behind vague
              success claims. We built a platform that sends real discovery signals and reports exactly what happened —
              with automatic credit refunds when crawls fail.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Today we serve SEO agencies, outreach teams, and affiliate marketers who need bulk URL submission, live
              pipeline tracking, and client-ready exports — without false Google indexing guarantees.
            </p>
          </AnimateIn>
        </section>

        <section className="mt-14">
          <AnimateIn>
            <h2 className="section-title text-xl">What we stand for</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {TRUST_BADGES.map((badge) => (
                <li key={badge} className="ui-card flex items-center gap-3 text-sm">
                  <Icon name="check-circle" size={18} className="shrink-0 text-[var(--green)]" />
                  {badge}
                </li>
              ))}
            </ul>
          </AnimateIn>
        </section>

        <section className="mt-16">
          <FounderSection />
        </section>

        <section className="mt-20">
          <TestimonialsGrid />
        </section>

        <section className="mt-16 ui-card ui-card-accent max-w-3xl p-8 text-center">
          <h2 className="section-title">Work with us</h2>
          <p className="section-desc mx-auto mt-3">
            Questions about partnerships or enterprise usage? We&apos;d love to hear from you.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact">Contact us</ButtonLink>
            <ButtonLink href="/register" variant="ghost">
              Create account
            </ButtonLink>
          </div>
        </section>

        <nav className="mt-12 flex flex-wrap gap-4 text-sm" aria-label="Related pages">
          <Link href="/case-studies" className="text-link">
            Case studies
          </Link>
          <Link href="/security" className="text-link">
            Security
          </Link>
          <Link href="/privacy" className="text-link">
            Privacy policy
          </Link>
        </nav>
      </article>
    </>
  );
}
