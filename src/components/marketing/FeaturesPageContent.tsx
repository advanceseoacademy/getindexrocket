import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { APP_NAME } from "@/lib/brand";
import { FEATURES_SEO } from "@/lib/seo-content";

export function FeaturesPageContent() {
  return (
    <article className="site-container py-16">
      <AnimateIn>
        <h1 className="text-3xl font-bold md:text-4xl">
          {APP_NAME} Features — Backlink Indexing Platform
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--muted)]">
          Everything you need to submit third-party backlinks, track pipeline status, and report
          results to clients. Built for SEO professionals who index URLs they do not own — without
          false guarantees or black-hat tricks.
        </p>
      </AnimateIn>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {FEATURES_SEO.map((f, i) => (
          <AnimateIn key={f.title} delay={i * 50}>
            <section className="hover-lift h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
            </section>
          </AnimateIn>
        ))}
      </div>

      <AnimateIn className="mt-16 rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-8">
        <h2 className="text-xl font-bold">Who is {APP_NAME} for?</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Link builders",
              text: "Index guest posts and outreach placements without asking site owners for Search Console access.",
            },
            {
              title: "SEO agencies",
              text: "Run bulk campaigns for multiple clients, track URL status, and export CSV reports.",
            },
            {
              title: "Affiliate marketers",
              text: "Push new money pages and tier-1 content through the discovery pipeline faster.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-semibold text-[var(--green)]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </AnimateIn>

      <AnimateIn className="mt-12 text-center">
        <Link
          href="/register"
          className="btn-primary inline-flex rounded-[10px] bg-[var(--green)] px-8 py-3.5 font-semibold text-[var(--on-accent)] no-underline"
        >
          Get started free →
        </Link>
        <p className="mt-4 text-sm text-[var(--muted)]">
          <Link href="/pricing" className="text-[var(--green)] no-underline hover:underline">
            View pricing
          </Link>
          {" · "}
          <Link href="/how-it-works" className="text-[var(--green)] no-underline hover:underline">
            How it works
          </Link>
        </p>
      </AnimateIn>
    </article>
  );
}
