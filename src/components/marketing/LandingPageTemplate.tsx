import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import type { LandingPage } from "@/lib/landing-pages";
import { getRelatedLandingPages } from "@/lib/landing-pages";
import { APP_NAME } from "@/lib/brand";

type LandingPageTemplateProps = {
  page: LandingPage;
};

const CORE_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/refund-policy", label: "Refund policy" },
] as const;

export function LandingPageTemplate({ page }: LandingPageTemplateProps) {
  const related = getRelatedLandingPages(page.relatedSlugs);

  return (
    <article className="site-container section-pad">
      <header className="max-w-3xl">
        <AnimateIn>
          <p className="eyebrow">{page.breadcrumbLabel}</p>
          <h1 className="text-display mt-1">{page.h1}</h1>
          <p className="text-lead mt-5">{page.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/register" size="lg">
              Start free — 1 credit per URL
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="ghost" size="lg">
              See how it works
            </ButtonLink>
          </div>
        </AnimateIn>
      </header>

      <div className="mt-16 space-y-14 lg:space-y-16">
        {page.sections.map((section, i) => (
          <AnimateIn key={section.id} delay={i * 40}>
            <section id={section.id} className="max-w-3xl scroll-mt-24">
              <h2 className="section-title text-xl md:text-2xl">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className="text-sm leading-relaxed text-[var(--muted)] md:text-base">
                    {p}
                  </p>
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-5 space-y-2.5">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--muted)] md:text-base">
                      <Icon name="check" size={18} className="mt-0.5 shrink-0 text-[var(--green)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </AnimateIn>
        ))}
      </div>

      <section className="mt-20" aria-labelledby={`${page.slug}-faq`}>
        <SectionHeader
          id={`${page.slug}-faq`}
          eyebrow="FAQ"
          title={`${page.breadcrumbLabel} — frequently asked questions`}
          desc={`Common questions about ${page.breadcrumbLabel.toLowerCase()} with ${APP_NAME}.`}
        />
        <div className="mt-8 max-w-3xl space-y-3">
          {page.faq.map((item, i) => (
            <AnimateIn key={item.q} delay={i * 40}>
              <details className="faq-item ui-card group p-5 open:border-[var(--accent-20)]">
                <summary className="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="faq-toggle" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
              </details>
            </AnimateIn>
          ))}
        </div>
      </section>

      <AnimateIn className="mt-16">
        <div className="ui-card ui-card-accent max-w-3xl p-8 text-center md:p-10">
          <h2 className="section-title">{page.cta.title}</h2>
          <p className="section-desc mx-auto mt-3">{page.cta.description}</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg" fullWidth className="sm:w-auto">
              Create free account
            </ButtonLink>
            <ButtonLink href="/pricing" variant="ghost" size="lg" fullWidth className="sm:w-auto">
              View pricing
            </ButtonLink>
          </div>
        </div>
      </AnimateIn>

      {related.length > 0 && (
        <section className="mt-16 max-w-3xl" aria-labelledby={`${page.slug}-related`}>
          <h2 id={`${page.slug}-related`} className="text-lg font-semibold">
            Related solutions
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/${r.slug}`} className="tag no-underline">
                  {r.breadcrumbLabel}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-12 max-w-3xl border-t border-[var(--card-border)] pt-8" aria-label="Site resources">
        <h2 className="text-sm font-semibold text-[var(--text)]">Explore {APP_NAME}</h2>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {CORE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
