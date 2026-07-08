import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { VisibleBreadcrumbs } from "@/components/marketing/VisibleBreadcrumbs";
import { CreditCalculator } from "@/components/marketing/CreditCalculator";
import { PricingEnterpriseCard, PricingPlansGrid } from "@/components/marketing/PricingPlansGrid";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CustomerLogos } from "@/components/marketing/trust/CustomerLogos";
import { TestimonialsGrid } from "@/components/marketing/trust/TestimonialsGrid";
import { APP_NAME } from "@/lib/brand";
import {
  COMPARISON_ROWS,
  ENTERPRISE_FEATURES,
  PLAN_COMPARISON,
  PRICING_FAQ,
  PRICING_HERO,
  PRICING_TRUST_POINTS,
  REFUND_POLICY_POINTS,
} from "@/lib/pricing-content";
import { TRUST_BADGES } from "@/lib/trust-content";

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex text-[var(--green)]" aria-label="Included">
        <Icon name="check" size={18} />
      </span>
    ) : (
      <span className="text-[var(--muted2)]" aria-label="Not included">
        —
      </span>
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

function PlanComparisonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">
                Feature
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">
                Starter
              </th>
              <th className="bg-[var(--accent-04)] px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
                Pro
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">
                Agency
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">
                Custom
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map((row, i) => (
              <tr
                key={row.feature}
                className={i < PLAN_COMPARISON.length - 1 ? "border-b border-[var(--card-border)]" : ""}
              >
                <td className="px-6 py-3.5 text-[var(--muted)]">{row.feature}</td>
                <td className="px-6 py-3.5 text-center">
                  <CellValue value={row.starter} />
                </td>
                <td className="bg-[var(--accent-03)] px-6 py-3.5 text-center">
                  <CellValue value={row.pro} />
                </td>
                <td className="px-6 py-3.5 text-center">
                  <CellValue value={row.agency} />
                </td>
                <td className="px-6 py-3.5 text-center">
                  <CellValue value={row.custom} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="divide-y divide-[var(--card-border)] md:hidden">
        {(["starter", "pro", "agency"] as const).map((plan) => (
          <div key={plan} className={plan === "pro" ? "bg-[var(--accent-03)]" : ""}>
            <p className="px-4 py-3 text-sm font-bold capitalize">{plan === "pro" ? "Pro · Popular" : plan}</p>
            <ul className="space-y-2 px-4 pb-4">
              {PLAN_COMPARISON.map((row) => (
                <li key={row.feature} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[var(--muted)]">{row.feature}</span>
                  <CellValue value={row[plan]} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorComparison() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--card-border)]">
      <div className="hidden md:grid md:grid-cols-3">
        <div className="border-b border-[var(--card-border)] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">
          Feature
        </div>
        <div className="border-b border-l border-[var(--card-border)] bg-[var(--accent-03)] px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
          {APP_NAME}
        </div>
        <div className="border-b border-l border-[var(--card-border)] px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted2)]">
          Typical indexers
        </div>
        {COMPARISON_ROWS.map((row, i) => (
          <div key={row.feature} className="contents">
            <div
              className={`px-6 py-4 text-sm ${i < COMPARISON_ROWS.length - 1 ? "border-b border-[var(--card-border)]" : ""}`}
            >
              {row.feature}
            </div>
            <div
              className={`border-l border-[var(--card-border)] bg-[var(--accent-03)] px-6 py-4 text-center text-sm ${i < COMPARISON_ROWS.length - 1 ? "border-b" : ""}`}
            >
              {row.us === true ? (
                <Icon name="check" size={18} className="mx-auto text-[var(--green)]" />
              ) : (
                row.us
              )}
            </div>
            <div
              className={`border-l border-[var(--card-border)] px-6 py-4 text-center text-sm text-[var(--muted)] ${i < COMPARISON_ROWS.length - 1 ? "border-b border-[var(--card-border)]" : ""}`}
            >
              {row.them === false ? (
                <span className="text-[var(--muted2)]">—</span>
              ) : (
                row.them
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3 p-4 md:hidden">
        {COMPARISON_ROWS.map((row) => (
          <div key={row.feature} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm font-medium">{row.feature}</p>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-[var(--green)]">
                {APP_NAME}: {row.us === true ? "✓" : row.us}
              </span>
              <span className="text-[var(--muted)]">
                Others: {row.them === false ? "—" : row.them}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingPageContent() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="site-container section-pad-sm">
        <VisibleBreadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]}
        />
        <div className="mx-auto max-w-3xl text-center">
          <AnimateIn>
            <p className="eyebrow">{PRICING_HERO.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {PRICING_HERO.title}
            </h1>
            <p className="section-desc mx-auto mt-4">{PRICING_HERO.desc}</p>
          </AnimateIn>

          <AnimateIn delay={80} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/register?plan=pro" size="lg">
              Start with Pro — $20/mo
            </ButtonLink>
            <ButtonLink href="#calculator" variant="ghost" size="lg">
              Calculate credits
            </ButtonLink>
          </AnimateIn>

          <AnimateIn delay={120} className="mt-8 flex flex-wrap justify-center gap-2">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]"
              >
                {badge}
              </span>
            ))}
          </AnimateIn>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TRUST_POINTS.map((point, i) => (
            <AnimateIn key={point.label} delay={i * 50}>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
                <p className="text-sm font-semibold">{point.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{point.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <SectionHeader
          align="center"
          eyebrow="Membership plans"
          title="Pick your credit volume"
          desc="Monthly membership via Buy Me a Coffee. Cancel anytime. Every plan includes the same honest indexing pipeline."
        />
        <div className="mt-10">
          <PricingPlansGrid />
        </div>
        <PricingEnterpriseCard />
        <p className="mt-6 text-center text-xs text-[var(--muted2)]">
          Payments processed securely by{" "}
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--green)] no-underline hover:underline"
          >
            Buy Me a Coffee
          </a>
          . Card details never touch our servers.
        </p>
      </section>

      {/* Calculator */}
      <section id="calculator" className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <CreditCalculator />
      </section>

      {/* Plan comparison */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <SectionHeader
          align="center"
          eyebrow="Compare plans"
          title="Feature comparison"
          desc="Same core product on every tier — higher plans add credits, bonus volume, and priority processing."
        />
        <div className="mt-10">
          <PlanComparisonTable />
        </div>
      </section>

      {/* Refund policy */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <SectionHeader
            eyebrow="Fair billing"
            title="Refund policy built in"
            desc="You only pay for URLs that complete our pipeline. Failed crawls are refunded automatically — no forms, no waiting."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {REFUND_POLICY_POINTS.map((point, i) => (
              <AnimateIn key={point.title} delay={i * 50}>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                  <p className="font-semibold">{point.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{point.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/refund-policy" className="text-link text-sm">
            Read full refund policy →
          </Link>
        </div>
      </section>

      {/* vs competitors */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <SectionHeader
          align="center"
          eyebrow="Why us"
          title={`${APP_NAME} vs typical indexers`}
          desc="Transparent pricing and honest status labels — not vanity metrics."
        />
        <div className="mt-10">
          <CompetitorComparison />
        </div>
      </section>

      {/* Enterprise */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <div className="rounded-2xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--bg2)] to-[var(--card)] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">Enterprise</p>
              <h2 className="section-title mt-1">Volume pricing for agencies</h2>
              <p className="section-desc mt-3">
                Running large link building programs? We offer custom credit packs, invoice billing, and
                dedicated onboarding for teams indexing hundreds of URLs every month.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="mailto:support@getindexrocket.com?subject=Enterprise%20pricing">
                  Talk to sales
                </ButtonLink>
                <ButtonLink href="/case-studies" variant="ghost">
                  View case studies
                </ButtonLink>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ENTERPRISE_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm"
                >
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <CustomerLogos />
      </section>

      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <TestimonialsGrid limit={3} />
      </section>

      {/* FAQ */}
      <section className="site-container section-pad-sm border-t border-[var(--card-border)]">
        <SectionHeader align="center" eyebrow="FAQ" title="Pricing questions" />
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {PRICING_FAQ.map((item, i) => (
            <AnimateIn key={item.q} delay={i * 30}>
              <details className="faq-item rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
              </details>
            </AnimateIn>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          More answers in our{" "}
          <Link href="/faq" className="text-link">
            full FAQ
          </Link>
          {" · "}
          <Link href="/how-it-works" className="text-link">
            How it works
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="site-container section-pad-sm">
        <AnimateIn variant="scale">
          <div className="rounded-2xl border border-[var(--green)]/30 bg-gradient-to-br from-[var(--accent-08)] to-[var(--bg2)] px-6 py-12 text-center md:px-12">
            <h2 className="text-2xl font-bold md:text-3xl">Ready to index your backlinks?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)]">
              Create a free account, pick a plan, and submit your first URLs in minutes. Pro is the
              best value for most teams — 110 credits for $20/mo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/register?plan=pro" size="lg">
                Get started — Pro plan
              </ButtonLink>
              <ButtonLink href="/register" variant="secondary" size="lg">
                Create free account
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-[var(--muted2)]">
              No setup fees · Cancel membership anytime · Auto-refund on crawl fail
            </p>
          </div>
        </AnimateIn>
      </section>
    </div>
  );
}
