import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CaseStudyCards } from "@/components/marketing/trust/CaseStudyCards";
import { CustomerLogos } from "@/components/marketing/trust/CustomerLogos";
import { TestimonialsGrid } from "@/components/marketing/trust/TestimonialsGrid";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { APP_NAME, SIGNUP_BONUS_CREDITS } from "@/lib/brand";
import {
  COMPARISON_ROWS,
  FEATURE_CARDS,
  HOW_IT_WORKS,
  USE_CASES,
} from "@/lib/home-content";
import { TRUST_BADGES } from "@/lib/trust-content";
import { FAQ_ITEMS } from "./faq-data";

const PLATFORMS = [
  "Guest post articles",
  "Blogspot / Blogger",
  "WordPress.com",
  "Medium-style blogs",
  "Web 2.0 properties",
  "Forum & profile links",
  "Niche edit placements",
  "Press releases",
  "Product pages",
  "Directory citations",
] as const;

const FAQ_PREVIEW = FAQ_ITEMS.slice(0, 4);

function MidPageCta({
  title,
  desc,
  primaryHref = "/register",
  primaryLabel = "Create free account",
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  desc: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <AnimateIn variant="scale">
      <div className="ui-card ui-card-accent px-6 py-10 text-center md:px-12 md:py-14">
        <h3 className="text-xl font-bold md:text-2xl">{title}</h3>
        <p className="section-desc mx-auto mt-3 max-w-lg">{desc}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={primaryHref} fullWidth className="sm:w-auto">
            {primaryLabel}
          </ButtonLink>
          {secondaryHref && secondaryLabel && (
            <ButtonLink href={secondaryHref} variant="ghost" fullWidth className="sm:w-auto">
              {secondaryLabel}
            </ButtonLink>
          )}
        </div>
      </div>
    </AnimateIn>
  );
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 font-medium text-[var(--success)]">
        <Icon name="check" size={16} className="shrink-0" />
        Yes
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 text-[var(--muted)]">
        <Icon name="x" size={16} className="shrink-0 opacity-70" />
        No
      </span>
    );
  }
  return <span className="text-[var(--muted)]">{value}</span>;
}

export function HomeSections() {
  return (
    <>
      <section className="section-pad-sm border-y border-[var(--card-border)] bg-[var(--bg2)]/50">
        <div className="site-container">
          <CustomerLogos />
        </div>
      </section>

      <section id="features" className="section-below-fold section-pad site-container">
        <SectionHeader
          eyebrow="Features"
          title="Built for honest backlink indexing"
          desc="Everything link builders need — from bulk submission to live pipeline tracking — without false indexing guarantees."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {FEATURE_CARDS.map((f, i) => (
            <AnimateIn key={f.title} delay={i * 50}>
              <article className="ui-card hover-lift group h-full">
                <span className="icon-box" aria-hidden>
                  <Icon name={f.icon} size={20} />
                </span>
                <h3 className="mt-5 text-base font-semibold md:text-lg">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
              </article>
            </AnimateIn>
          ))}
        </div>
        <div className="mt-14">
          <MidPageCta
            title="Start indexing your first backlink today"
            desc={`Create a free account and get ${SIGNUP_BONUS_CREDITS} free credits instantly — submit your first URLs in under 60 seconds.`}
            primaryLabel={`Get ${SIGNUP_BONUS_CREDITS} free credits`}
            secondaryHref="/pricing"
            secondaryLabel="View pricing"
          />
        </div>
      </section>

      <section className="section-below-fold section-pad bg-[var(--bg2)]/40">
        <div className="site-container">
          <SectionHeader
            eyebrow="Why switch"
            title={`${APP_NAME} vs traditional indexers`}
            desc="Most indexers hide behind vague 'indexed' labels. We show a real pipeline — and refund credits when crawls fail."
          />
          <div className="ui-card mt-10 overflow-hidden p-0">
            <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_1fr]">
              <div className="border-b border-[var(--card-border)] bg-[var(--bg3)] px-6 py-4 text-sm font-semibold">
                Feature
              </div>
              <div className="border-b border-l border-[var(--card-border)] bg-[var(--accent-05)] px-6 py-4 text-center text-sm font-semibold text-[var(--green)]">
                {APP_NAME}
              </div>
              <div className="border-b border-l border-[var(--card-border)] bg-[var(--bg3)] px-6 py-4 text-center text-sm font-semibold text-[var(--muted)]">
                Traditional indexers
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
                    <ComparisonCell value={row.us} />
                  </div>
                  <div
                    className={`border-l border-[var(--card-border)] px-6 py-4 text-center text-sm ${i < COMPARISON_ROWS.length - 1 ? "border-b border-[var(--card-border)]" : ""}`}
                  >
                    <ComparisonCell value={row.them} />
                  </div>
                </div>
              ))}
            </div>
            <div className="divide-y divide-[var(--card-border)] md:hidden">
              {COMPARISON_ROWS.map((row) => (
                <div key={row.feature} className="p-4">
                  <p className="text-sm font-medium">{row.feature}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-[var(--accent-05)] p-3 text-center">
                      <p className="mb-1.5 text-xs font-semibold text-[var(--green)]">{APP_NAME}</p>
                      <ComparisonCell value={row.us} />
                    </div>
                    <div className="rounded-lg bg-[var(--bg3)] p-3 text-center">
                      <p className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Others</p>
                      <ComparisonCell value={row.them} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section-below-fold section-pad site-container">
        <SectionHeader
          eyebrow="How it works"
          title="Four steps to discovery"
          desc="A transparent pipeline — you always see what happened and what's still in progress."
        />
        <ol className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <li key={s.step}>
              <AnimateIn delay={i * 70}>
              <article className="ui-card ui-card-muted hover-lift relative h-full">
                <div className="flex items-start justify-between gap-3">
                  <span className="icon-box icon-box-lg" aria-hidden>
                    <Icon name={s.icon} size={22} />
                  </span>
                  <span className="text-xs font-bold tracking-wider text-[var(--green)] opacity-70">{s.step}</span>
                </div>
                <h3 className="mt-5 font-semibold">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
              </article>
              </AnimateIn>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/how-it-works" className="text-link inline-flex items-center gap-1.5 text-sm">
            Read the full technical breakdown
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      <section className="site-container section-pad-sm">
        <AnimateIn>
          <div className="ui-card ui-card-accent px-6 py-10 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="section-title text-xl md:text-2xl">
                  Backlink not crawled? Credit refunded automatically.
                </h2>
                <p className="section-desc mt-3">
                  If crawl verification fails, the URL is marked{" "}
                  <strong className="font-semibold text-[var(--text)]">Refunded</strong> and 1 credit returns to your
                  balance — instantly. We don&apos;t guarantee Google indexing, but you never lose credits on failed
                  crawls.
                </p>
              </div>
              <ButtonLink href="/refund-policy" variant="ghost" className="shrink-0 self-start md:self-center">
                Refund policy
                <Icon name="arrow-right" size={16} />
              </ButtonLink>
            </div>
          </div>
        </AnimateIn>
      </section>

      <section className="section-below-fold section-pad site-container">
        <SectionHeader title={`Who uses ${APP_NAME}`} desc="Built for anyone indexing URLs they don't own." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {USE_CASES.map((u, i) => (
            <AnimateIn key={u.title} delay={i * 70}>
              <article className="ui-card hover-lift h-full">
                <span className="icon-box icon-box-blue" aria-hidden>
                  <Icon name={u.icon} size={20} />
                </span>
                <h3 className="mt-4 font-semibold">{u.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">{u.desc}</p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="section-below-fold section-pad site-container">
        <SectionHeader
          eyebrow="Case studies"
          title="Real workflows from SEO teams"
          desc="How agencies and link builders use our pipeline for guest posts, niche edits, and bulk campaigns."
        />
        <div className="mt-12">
          <CaseStudyCards compact />
        </div>
        <div className="mt-8 text-center">
          <Link href="/case-studies" className="text-link inline-flex items-center gap-1.5 text-sm">
            View all case studies
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      <section className="section-below-fold section-pad bg-[var(--bg2)]/40">
        <div className="site-container">
          <TestimonialsGrid />
        </div>
      </section>

      <section className="section-below-fold section-pad site-container">
        <SectionHeader
          title="Supported URL types"
          desc="Submit any valid public HTTP/HTTPS URL from these common third-party hosts."
        />
        <div className="mt-8 flex flex-wrap gap-2.5 md:gap-3">
          {PLATFORMS.map((p, i) => (
            <AnimateIn key={p} delay={i * 35} variant="fade-in">
              <span className="tag">{p}</span>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section id="pricing-preview" className="site-container section-pad-sm">
        <AnimateIn>
          <div className="ui-card ui-card-muted px-6 py-10 text-center md:px-12 md:py-14">
            <p className="eyebrow">Pricing</p>
            <h2 className="section-title mt-1">Simple credit pricing</h2>
            <p className="section-desc mx-auto mt-3 max-w-xl">
              <strong className="font-semibold text-[var(--text)]">1 credit = 1 URL.</strong> New
              accounts get{" "}
              <strong className="font-semibold text-[var(--text)]">
                {SIGNUP_BONUS_CREDITS} free credits
              </strong>
              . Then choose a membership — Starter $10 (50 credits), Pro $20 (110 credits), Agency $50
              (270 credits).
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/register" fullWidth className="sm:w-auto">
                Get {SIGNUP_BONUS_CREDITS} free credits
              </ButtonLink>
              <ButtonLink href="/pricing" variant="ghost" fullWidth className="sm:w-auto">
                Compare all plans
                <Icon name="arrow-right" size={16} />
              </ButtonLink>
            </div>
          </div>
        </AnimateIn>
      </section>

      <section id="faq" className="section-below-fold section-pad site-container">
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions"
          desc="Quick answers before you sign up. See the full FAQ for billing, bulk submit, and refund details."
        />
        <div className="mt-10 space-y-3">
          {FAQ_PREVIEW.map((item, i) => (
            <AnimateIn key={item.q} delay={i * 50}>
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
        <div className="mt-8 text-center">
          <Link href="/faq" className="text-link inline-flex items-center gap-1.5 text-sm">
            View all {FAQ_ITEMS.length} questions
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      <section className="site-container section-pad-sm">
        <AnimateIn>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TRUST_BADGES.map((badge) => (
              <span key={badge} className="pill text-[var(--muted)]">
                <Icon name="shield" size={14} className="text-[var(--green)]" />
                {badge}
              </span>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            <Link href="/security" className="text-link">
              Security
            </Link>
            {" · "}
            <Link href="/privacy" className="text-link">
              Privacy
            </Link>
            {" · "}
            <Link href="/refund-policy" className="text-link">
              Refunds
            </Link>
            {" · "}
            <Link href="/contact" className="text-link">
              Support
            </Link>
          </p>
        </AnimateIn>
      </section>

      <section className="site-container pb-16 pt-2 md:pb-24">
        <AnimateIn variant="scale">
          <div className="ui-card ui-card-accent hover-lift border-[var(--green)] p-8 text-center md:p-14">
            <h2 className="section-title">Ready to get your backlinks discovered?</h2>
            <p className="section-desc mx-auto mt-4 max-w-lg">
              Join link builders using {APP_NAME} for honest pipeline tracking, bulk submission, and automatic credit
              protection. Sign up free and get {SIGNUP_BONUS_CREDITS} credits to try it.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/register" size="lg" fullWidth className="sm:w-auto">
                Get {SIGNUP_BONUS_CREDITS} free credits
              </ButtonLink>
              <ButtonLink href="/login" variant="ghost" size="lg" fullWidth className="sm:w-auto">
                Sign in
              </ButtonLink>
            </div>
            <p className="mt-6 text-xs text-[var(--muted)]">
              {SIGNUP_BONUS_CREDITS} free credits on signup · No credit card required · 1 credit per URL ·
              Auto-refund on crawl fail
            </p>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
