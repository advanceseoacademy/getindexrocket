import Link from "next/link";
import { BMC_MEMBERSHIP_URL } from "@/lib/brand";
import { PricingPlanButton } from "@/components/marketing/PricingPlanButton";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { CREDIT_PLANS } from "@/lib/pricing-plans";

function FeatureIcon({ text }: { text: string }) {
  if (text.startsWith("★")) {
    return <span className="text-[var(--amber)]">★</span>;
  }
  return <span className="text-[var(--green)]">✓</span>;
}

export function PricingCards() {
  return (
    <div className="space-y-16">
      <AnimateIn variant="scale">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6 text-center">
          <p className="text-lg font-semibold">1 credit = 1 URL submitted</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            1 credit per URL. Auto credit refund if crawl fails.{" "}
            <Link href="/refund-policy" className="text-[var(--green)] no-underline hover:underline">
              Refund policy
            </Link>
          </p>
        </div>
      </AnimateIn>

      <div>
        <AnimateIn>
          <h2 className="text-2xl font-bold">Membership Plans</h2>
          <p className="mt-2 text-[var(--muted)]">
            Monthly membership via Buy Me a Coffee — cancel anytime.
          </p>
        </AnimateIn>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {CREDIT_PLANS.map((plan, i) => (
            <AnimateIn key={plan.id} delay={i * 80}>
              <div
                className={`hover-lift flex h-full flex-col rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-[var(--green)] bg-[var(--accent-05)]"
                    : "border-[var(--card-border)] bg-[var(--card)]"
                }`}
              >
              {plan.badge && (
                <span className="text-xs font-medium text-[var(--green)]">{plan.badge}</span>
              )}
              <h3 className="mt-1 text-xl font-bold">{plan.name}</h3>
              <p className="mt-3">
                {plan.priceUsd > 0 ? (
                  <>
                    <span className="text-3xl font-bold">${plan.priceUsd}</span>
                    <span className="text-[var(--muted)]"> /month</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-[var(--muted)]">Flexible</span>
                )}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-[var(--muted)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <FeatureIcon text={f} />
                    <span>{f.replace(/^★\s*/, "")}</span>
                  </li>
                ))}
              </ul>
              {plan.id === "custom" ? (
                <Link
                  href={BMC_MEMBERSHIP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full justify-center rounded-[10px] border border-[var(--card-border)] py-3 font-semibold text-[var(--text)] no-underline hover:border-[var(--green)]"
                >
                  Contact us
                </Link>
              ) : (
                <PricingPlanButton planId={plan.id} label="Join membership" />
              )}
              </div>
            </AnimateIn>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Membership page:{" "}
          <a
            href={BMC_MEMBERSHIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--green)] no-underline"
          >
            buymeacoffee.com/litonislam/membership
          </a>
        </p>
      </div>
    </div>
  );
}
