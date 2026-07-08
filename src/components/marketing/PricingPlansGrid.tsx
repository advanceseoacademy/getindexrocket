import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { PricingPlanButton } from "@/components/marketing/PricingPlanButton";
import { BMC_MEMBERSHIP_URL } from "@/lib/brand";
import { CREDIT_PLANS } from "@/lib/pricing-plans";

function FeatureIcon({ text }: { text: string }) {
  if (text.startsWith("★")) return <span className="text-[var(--amber)]">★</span>;
  return <span className="text-[var(--green)]">✓</span>;
}

function costPerUrl(price: number, credits: number) {
  return `$${(price / credits).toFixed(2)}`;
}

export function PricingPlansGrid() {
  const paidPlans = CREDIT_PLANS.filter((p) => p.id !== "custom");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {paidPlans.map((plan, i) => {
        const popular = plan.highlight;
        return (
          <AnimateIn key={plan.id} delay={i * 60} variant="scale">
            <div
              className={`relative flex h-full flex-col rounded-2xl border p-6 md:p-7 ${
                popular
                  ? "z-10 border-[var(--green)] bg-gradient-to-b from-[var(--accent-08)] to-[var(--card)] shadow-[0_0_0_1px_var(--green),0_20px_40px_-12px_rgba(0,0,0,0.35)] lg:scale-[1.03]"
                  : "border-[var(--card-border)] bg-[var(--card)] hover-lift"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--green)] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--on-accent)]">
                  Most popular
                </span>
              )}

              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.bonusCredits && (
                  <span className="rounded-full bg-[var(--amber)]/15 px-2.5 py-0.5 text-[10px] font-bold text-[var(--amber)]">
                    +{plan.bonusCredits} bonus
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">${plan.priceUsd}</span>
                <span className="text-sm text-[var(--muted)]">/month</span>
              </div>

              <p className="mt-2 text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--text)]">{plan.credits} credits</span>
                {" · "}
                {costPerUrl(plan.priceUsd, plan.credits)}/URL
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--muted)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <FeatureIcon text={f} />
                    <span>{f.replace(/^★\s*/, "")}</span>
                  </li>
                ))}
              </ul>

              <PricingPlanButton
                planId={plan.id}
                label={popular ? "Get started — Pro" : `Choose ${plan.name}`}
                variant={popular ? "primary" : "secondary"}
              />
            </div>
          </AnimateIn>
        );
      })}
    </div>
  );
}

export function PricingEnterpriseCard() {

  return (
    <AnimateIn variant="fade-in">
      <div className="mt-8 rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
        <div className="max-w-xl">
          <p className="eyebrow">Enterprise &amp; agencies</p>
          <h3 className="mt-1 text-xl font-bold">Custom &amp; Enterprise</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Indexing 500+ URLs per month? Get volume pricing, invoice billing, and dedicated onboarding
            for your team.
          </p>
        </div>
        <div className="mt-5 flex shrink-0 flex-wrap gap-3 md:mt-0">
          <Link
            href="mailto:support@getindexrocket.com?subject=Enterprise%20pricing"
            className="btn btn-primary btn-md"
          >
            Contact sales
          </Link>
          <Link
            href={BMC_MEMBERSHIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-md"
          >
            Custom credits
          </Link>
        </div>
      </div>
    </AnimateIn>
  );
}
