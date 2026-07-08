import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { APP_NAME } from "@/lib/brand";
import { BACKLINK_INDEXING_FAQ, HOW_IT_WORKS_STEPS } from "@/lib/seo-content";

export function HowItWorksPageContent() {
  return (
    <article className="site-container section-pad">
      <AnimateIn>
        <p className="eyebrow">How it works</p>
        <h1 className="text-display max-w-4xl">How {APP_NAME} Backlink Indexing Works</h1>
        <p className="text-lead mt-5 max-w-3xl">
          A transparent five-step pipeline from URL submission to crawl verification. You always
          know what happened, what is in progress, and when credits are refunded.
        </p>
      </AnimateIn>

      <ol className="mt-12 space-y-6">
        {HOW_IT_WORKS_STEPS.map((s, i) => (
          <AnimateIn key={s.step} delay={i * 60}>
            <li className="ui-card hover-lift flex gap-6">
              <span className="icon-box icon-box-lg shrink-0 font-bold text-[var(--green)]">
                {s.step}
              </span>
              <div>
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
              </div>
            </li>
          </AnimateIn>
        ))}
      </ol>

      <section className="mt-16">
        <AnimateIn>
          <h2 className="text-2xl font-bold">Understanding backlink indexing</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            When you build a backlink on a site you do not own, search engines must discover and
            crawl that page before the link can contribute to rankings. New or low-traffic pages
            are often crawled slowly. {APP_NAME} sends discovery signals through a structured
            pipeline so bots find your URLs faster — while showing you honest status at every step.
          </p>
        </AnimateIn>

        <div className="mt-8 space-y-4">
          {BACKLINK_INDEXING_FAQ.map((item, i) => (
            <AnimateIn key={item.q} delay={i * 40}>
              <details className="faq-item rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
              </details>
            </AnimateIn>
          ))}
        </div>
      </section>

      <AnimateIn className="mt-12 ui-card ui-card-accent p-8 text-center">
        <h2 className="text-xl font-bold">Ready to submit your first URL?</h2>
        <p className="section-desc mx-auto mt-3 max-w-lg">
          1 credit = 1 URL. Automatic refund if crawl fails.{" "}
          <Link href="/refund-policy" className="text-link">
            Read refund policy
          </Link>
        </p>
        <ButtonLink href="/register" className="mt-6">
          Create free account
        </ButtonLink>
      </AnimateIn>
    </article>
  );
}
