import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/BreadcrumbJsonLd";
import { BlogItemListJsonLd } from "@/components/marketing/BlogItemListJsonLd";
import { FaqPageJsonLd } from "@/components/marketing/FaqPageJsonLd";
import { VisibleBreadcrumbs } from "@/components/marketing/VisibleBreadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FAQ_ITEMS } from "@/components/marketing/faq-data";
import { APP_NAME } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-static";

export const metadata = buildPageMetadata({
  title: "FAQ",
  description: `Frequently asked questions about ${APP_NAME} — backlink indexing, credits, bulk submit, and refunds.`,
  path: "/faq",
  keywords: ["backlink indexing faq", "url indexing questions", "getindexrocket faq"],
});

export default function FaqPage() {
  return (
    <>
      <FaqPageJsonLd items={FAQ_ITEMS} path="/faq" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
      />
      <article className="site-container section-pad">
        <VisibleBreadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]}
        />
        <p className="eyebrow">FAQ</p>
        <h1 className="text-display">Frequently asked questions</h1>
        <p className="text-lead mt-4 max-w-2xl">
          Everything you need to know about {APP_NAME} — credits, third-party URLs, bulk submission, and
          refunds.
        </p>

        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="faq-item ui-card group p-5 open:border-[var(--accent-20)]"
            >
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
          ))}
        </div>

        <div className="ui-card ui-card-muted mt-12 p-8 text-center">
          <h2 className="text-xl font-bold">Still have questions?</h2>
          <p className="section-desc mx-auto mt-2">
            Create a free account to explore the dashboard, or reach out to our support team directly.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/register">Create free account</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Contact support
            </ButtonLink>
          </div>
        </div>
      </article>
    </>
  );
}
