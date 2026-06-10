import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { FAQ_ITEMS } from "./faq-data";

const FEATURES = [
  {
    title: "Backlink submissions",
    desc: "Submit guest posts, niche edits, and third-party URLs — no Search Console access required.",
  },
  {
    title: "Fast discovery signals",
    desc: "URLs are pushed through our discovery pipeline for rapid search engine discovery workflows.",
  },
  {
    title: "Live pipeline tracking",
    desc: "Track Submitted, Processing, Crawled, or Refunded status for every URL in one dashboard.",
  },
  {
    title: "Bulk URL paste",
    desc: "Paste URL lists line-by-line from your dashboard — up to 10,000 URLs per submission batch.",
  },
  {
    title: "Auto credit refund",
    desc: "If crawl verification fails, your credit is automatically returned — no support ticket needed.",
  },
  {
    title: "Credit-based billing",
    desc: "Simple pricing: 1 credit per URL. Credits stay on your account while it is active.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Submit your URL",
    desc: "Paste a single backlink or bulk URL list. One credit per URL.",
  },
  {
    step: "02",
    title: "Discovery begins",
    desc: "We process your URL through our indexing network which triggers search engine discovery signals.",
  },
  {
    step: "03",
    title: "Crawl verification",
    desc: "The system verifies the host is reachable. Failed crawls trigger an automatic credit refund.",
  },
  {
    step: "04",
    title: "Monitor results",
    desc: "Watch live status in your dashboard. Submitted means signals were sent — indexing depends on Google.",
  },
];

const USE_CASES = [
  { title: "Link builders", desc: "Index guest posts and outreach placements without asking site owners for GSC access." },
  { title: "SEO agencies", desc: "Run bulk campaigns, track client URLs, and report honest pipeline status." },
  { title: "Affiliate marketers", desc: "Push new money pages and tier-1 content through discovery faster." },
];

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
];

export function HomeSections() {
  return (
    <>
      <section className="site-container py-12">
        <div className="grid gap-8 rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] px-6 py-10 sm:grid-cols-3 md:px-10">
          {[
            ["1 credit", "Per URL submitted"],
            ["Pay as", "You go credits"],
            ["Live", "Status tracking"],
          ].map(([val, lbl], i) => (
            <AnimateIn key={lbl} delay={i * 80} variant="scale">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--green)]">{val}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{lbl}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section id="features" className="section-below-fold site-container py-20">
        <AnimateIn>
          <h2 className="text-2xl font-bold md:text-3xl">
            Everything you need to push URLs into the index pipeline
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            From a single guest post to thousands of backlinks — submit, track, and report in one platform.
          </p>
        </AnimateIn>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <AnimateIn key={f.title} delay={i * 60}>
              <div className="hover-lift h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="site-container py-12">
        <AnimateIn>
          <div className="rounded-2xl border border-[var(--accent-25)] bg-[var(--accent-05)] px-6 py-10 text-center md:px-10">
            <h2 className="text-xl font-bold md:text-2xl">Backlink not crawled? Credit refunded automatically.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              If crawl verification fails, the URL is marked <strong className="text-[var(--text)]">Refunded</strong>{" "}
              and 1 credit is returned to your balance — instantly, no ticket needed. We do not guarantee
              Google indexing, but you never lose credits on failed crawls.
            </p>
            <Link
              href="/refund-policy"
              className="mt-5 inline-flex text-sm font-medium text-[var(--green)] no-underline hover:underline"
            >
              Read full refund policy →
            </Link>
          </div>
        </AnimateIn>
      </section>

      <section id="how" className="section-below-fold site-container py-20">
        <AnimateIn>
          <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
          <p className="mt-3 text-[var(--muted)]">
            A transparent four-step pipeline — you always see what happened and what is still in progress.
          </p>
        </AnimateIn>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <AnimateIn key={s.step} delay={i * 70}>
              <div className="hover-lift h-full rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6">
                <span className="text-sm font-semibold text-[var(--green)]">Step {s.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{s.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="section-below-fold site-container py-20">
        <AnimateIn>
          <h2 className="text-2xl font-bold md:text-3xl">Who uses {APP_NAME}</h2>
        </AnimateIn>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {USE_CASES.map((u, i) => (
            <AnimateIn key={u.title} delay={i * 80}>
              <div className="hover-lift h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="font-semibold">{u.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{u.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="section-below-fold site-container py-20">
        <AnimateIn>
          <h2 className="text-2xl font-bold md:text-3xl">Supported URL types</h2>
          <p className="mt-3 text-[var(--muted)]">
            Submit any valid public HTTP/HTTPS URL from these common third-party hosts.
          </p>
        </AnimateIn>
        <div className="mt-8 flex flex-wrap gap-3">
          {PLATFORMS.map((p, i) => (
            <AnimateIn key={p} delay={i * 40} variant="fade-in">
              <span className="inline-block rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--blue-30)] hover:text-[var(--text)]">
                {p}
              </span>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section id="pricing-preview" className="section-below-fold site-container py-12">
        <AnimateIn>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] px-6 py-10 text-center md:px-10">
            <h2 className="text-2xl font-bold md:text-3xl">Simple credit pricing</h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              1 credit = 1 URL. Buy monthly membership packs — Starter $10 (50 credits),
              Pro $20 (110 credits), Agency $50 (270 credits).
            </p>
            <Link
              href="/pricing"
              className="btn-primary mt-8 inline-flex rounded-[10px] bg-[var(--green)] px-8 py-3.5 font-semibold text-[var(--on-accent)] no-underline"
            >
              View all plans →
            </Link>
          </div>
        </AnimateIn>
      </section>

      <section id="faq" className="section-below-fold site-container py-20">
        <AnimateIn>
          <h2 className="text-2xl font-bold md:text-3xl">Frequently asked questions</h2>
        </AnimateIn>
        <div className="mt-10 space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <AnimateIn key={item.q} delay={i * 50}>
              <details className="faq-item group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
              </details>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="site-container py-20">
        <AnimateIn variant="scale">
          <div className="hover-lift rounded-2xl border border-[var(--green)] bg-[var(--accent-05)] p-10 text-center">
            <h2 className="text-2xl font-bold">Ready to submit your first backlink?</h2>
            <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
              Create an account, buy credits, and watch your URLs move through the live pipeline.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary rounded-[10px] bg-[var(--green)] px-8 py-3.5 font-semibold text-[var(--on-accent)] no-underline"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="btn-ghost rounded-[10px] border border-[var(--card-border)] px-8 py-3.5 text-[var(--muted)] no-underline hover:text-[var(--text)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
