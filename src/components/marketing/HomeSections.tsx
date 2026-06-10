import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { FAQ_ITEMS } from "./faq-data";

const FEATURES = [
  {
    title: "Backlink submissions",
    desc: "Submit guest posts, PBN links, and third-party URLs — no Search Console access required.",
  },
  {
    title: "Fast discovery signals",
    desc: "URLs are pushed through our discovery pipeline for rapid Googlebot discovery workflows.",
  },
  {
    title: "Live pipeline tracking",
    desc: "Track Submitted, Discovered, Indexed, or Refunded status for every URL in one dashboard.",
  },
  {
    title: "Bulk & API ready",
    desc: "Paste URL lists, upload CSV files, or integrate via REST API for agency-scale campaigns.",
  },
  {
    title: "Auto refund policy",
    desc: "If crawl verification fails, your credit is automatically returned — no support tickets needed.",
  },
  {
    title: "Credit-based billing",
    desc: "Simple pricing: 1 credit per new URL. Credits never expire. No hidden monthly fees.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Submit your URL",
    desc: "Paste a single backlink, bulk upload a list, or connect via API. One credit per new URL.",
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
      <section className="border-y border-[var(--card-border)] bg-[var(--bg2)] py-12">
        <div className="site-container grid gap-8 sm:grid-cols-3">
          {[
            ["1 credit", "Per URL submitted"],
            ["Pay as", "You go credits"],
            ["Live", "Status tracking"],
          ].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <p className="text-2xl font-bold text-[var(--green)]">{val}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{lbl}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section-below-fold site-container py-20">
        <h2 className="text-2xl font-bold md:text-3xl">
          Everything you need to push URLs into the index pipeline
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          From a single guest post to thousands of backlinks — submit, track, and report in one platform.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section-below-fold site-container py-20">
        <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
        <p className="mt-3 text-[var(--muted)]">
          A transparent four-step pipeline — you always see what happened and what is still in progress.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6"
            >
              <span className="text-sm font-semibold text-[var(--green)]">Step {s.step}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-below-fold site-container py-20">
        <h2 className="text-2xl font-bold md:text-3xl">Who uses {APP_NAME}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <h3 className="font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-below-fold site-container py-20">
        <h2 className="text-2xl font-bold md:text-3xl">Supported URL types</h2>
        <p className="mt-3 text-[var(--muted)]">
          Submit any valid public HTTP/HTTPS URL from these common third-party hosts.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {PLATFORMS.map((p) => (
            <span
              key={p}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-4 py-2 text-sm text-[var(--muted)]"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <section id="pricing-preview" className="section-below-fold border-y border-[var(--card-border)] bg-[var(--bg2)] py-20">
        <div className="site-container text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Simple credit pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
            1 credit = 1 URL. Buy monthly membership packs — Starter $10 (50 credits),
            Pro $20 (110 credits), Agency $50 (270 credits).
          </p>
          <Link
            href="/pricing"
            className="mt-8 inline-flex rounded-[10px] bg-[var(--green)] px-8 py-3.5 font-semibold text-[#050f08] no-underline"
          >
            View all plans →
          </Link>
        </div>
      </section>

      <section id="faq" className="section-below-fold site-container py-20">
        <h2 className="text-2xl font-bold md:text-3xl">Frequently asked questions</h2>
        <div className="mt-10 space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5"
            >
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="site-container py-20">
        <div className="rounded-2xl border border-[var(--green)] bg-[rgba(34,211,122,0.05)] p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to submit your first backlink?</h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
            Create an account, buy credits, and watch your URLs move through the live pipeline.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-[10px] bg-[var(--green)] px-8 py-3.5 font-semibold text-[#050f08] no-underline"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-[10px] border border-[var(--card-border)] px-8 py-3.5 text-[var(--muted)] no-underline hover:text-[var(--text)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
