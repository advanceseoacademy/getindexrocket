import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { LegalPageJsonLd } from "@/components/marketing/LegalPageJsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Icon } from "@/components/ui/Icon";
import { APP_NAME } from "@/lib/brand";
import { CASE_STUDIES } from "@/lib/trust-content";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "Case Studies — Backlink Indexing Results",
  description: `See how SEO agencies and link builders use ${APP_NAME} for guest post indexing, niche edits, and honest pipeline reporting.`,
  path: "/case-studies",
  keywords: ["backlink indexing case study", "seo agency indexing", "guest post indexing results"],
});

export default function CaseStudiesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Case Studies", path: "/case-studies" },
        ]}
      />
      <LegalPageJsonLd
        path="/case-studies"
        name="Case Studies"
        description={`How SEO teams use ${APP_NAME} for backlink indexing campaigns.`}
      />
      <article className="site-container section-pad">
        <header className="max-w-3xl">
          <AnimateIn>
            <p className="eyebrow">Case studies</p>
            <h1 className="text-display">How teams use {APP_NAME}</h1>
            <p className="text-lead mt-5">
              Representative workflows from link building agencies, affiliate publishers, and outreach firms using our
              indexing pipeline for third-party URLs.
            </p>
          </AnimateIn>
        </header>

        <div className="mt-16 space-y-16">
          {CASE_STUDIES.map((study, i) => (
            <AnimateIn key={study.slug} delay={i * 40}>
              <section id={study.slug} className="scroll-mt-24 border-t border-[var(--card-border)] pt-12">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green)]">{study.client}</p>
                <h2 className="section-title mt-2 text-xl md:text-2xl">{study.title}</h2>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                  <div className="ui-card">
                    <h3 className="font-semibold">Challenge</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{study.challenge}</p>
                  </div>
                  <div className="ui-card">
                    <h3 className="font-semibold">Solution</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{study.solution}</p>
                  </div>
                  <div className="ui-card ui-card-accent">
                    <h3 className="font-semibold">Key outcome</h3>
                    <p className="mt-3 flex items-center gap-2 text-lg font-bold text-[var(--green)]">
                      <Icon name="chart" size={20} aria-hidden />
                      {study.metric}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {study.results.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                          <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[var(--green)]" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </AnimateIn>
          ))}
        </div>

        <div className="mt-16 ui-card ui-card-accent p-8 text-center">
          <h2 className="section-title">Ready to run your own campaign?</h2>
          <p className="section-desc mx-auto mt-3">Start with a free account — 1 credit per URL, auto-refund on crawl fail.</p>
          <ButtonLink href="/register" className="mt-6" size="lg">
            Get started
          </ButtonLink>
        </div>

        <nav className="mt-10 text-sm">
          <Link href="/about" className="text-link">
            ← About {APP_NAME}
          </Link>
        </nav>
      </article>
    </>
  );
}
