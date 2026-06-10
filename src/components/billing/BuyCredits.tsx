"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildBmcMembershipUrl,
  buildBmcPaymentUrl,
  getBmcMembershipUrl,
  getBmcUsername,
} from "@/lib/buymeacoffee-urls";
import { BMC_MEMBERSHIP_URL, BMC_WEBHOOK_URL } from "@/lib/brand";
import { CREDIT_PLANS } from "@/lib/pricing-plans";

type BuyCreditsProps = {
  userEmail: string;
  creditBalance: number;
};

function FeatureIcon({ text }: { text: string }) {
  if (text.startsWith("★")) return <span className="text-[var(--amber)]">★</span>;
  return <span className="text-[var(--green)]">✓</span>;
}

export function BuyCredits({ userEmail, creditBalance }: BuyCreditsProps) {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const bmcUsername = getBmcUsername();
  const membershipUrl = getBmcMembershipUrl() ?? BMC_MEMBERSHIP_URL;

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">Current balance</p>
        <p className="mt-1 text-3xl font-bold">{creditBalance} credits</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          1 credit = 1 URL · Account: {userEmail}
        </p>
      </div>

      {!bmcUsername && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Buy Me a Coffee username is not configured in `.env`.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {CREDIT_PLANS.map((plan) => {
          const paymentUrl =
            plan.id === "custom"
              ? buildBmcPaymentUrl(plan, userEmail)
              : buildBmcMembershipUrl(plan, userEmail);
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 ${
                isSelected || plan.highlight
                  ? "border-[var(--green)] bg-[rgba(34,211,122,0.05)]"
                  : "border-[var(--card-border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.badge && (
                  <span className="text-xs font-medium text-[var(--green)]">{plan.badge}</span>
                )}
              </div>
              <p className="mt-2">
                {plan.priceUsd > 0 ? (
                  <>
                    <span className="text-2xl font-bold">${plan.priceUsd}</span>
                    <span className="text-[var(--muted)]"> /month</span>
                  </>
                ) : (
                  <span className="text-[var(--muted)]">Flexible</span>
                )}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <FeatureIcon text={f} />
                    <span>{f.replace(/^★\s*/, "")}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "custom" ? (
                paymentUrl ? (
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full justify-center rounded-[10px] border border-[var(--card-border)] py-3 font-semibold text-[var(--text)] no-underline hover:border-[var(--green)]"
                  >
                    Contact us →
                  </a>
                ) : (
                  <Link
                    href="mailto:support@getindexrocket.com"
                    className="mt-6 inline-flex w-full justify-center rounded-[10px] border border-[var(--card-border)] py-3 font-semibold no-underline"
                  >
                    Email support
                  </Link>
                )
              ) : paymentUrl ? (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full justify-center rounded-[10px] bg-[var(--green)] py-3 font-semibold text-[#050f08] no-underline"
                >
                  Join {plan.name} — ${plan.priceUsd}/mo →
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full rounded-[10px] bg-[var(--green)] py-3 font-semibold text-[#050f08] opacity-50"
                >
                  Payment unavailable
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--card-border)] bg-[var(--bg2)] p-6 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--text)]">Payment instructions</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Use the <strong>same email</strong> on Buy Me a Coffee: {userEmail}
          </li>
          <li>Credits are added within a few minutes after payment</li>
          <li>Starter $10 = 50 · Pro $20 = 110 · Agency $50 = 270 credits/month</li>
          <li>Each URL submission costs 1 credit</li>
        </ol>
        <p className="mt-4 text-xs text-[var(--muted2)]">
          Membership:{" "}
          <a href={membershipUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--green)]">
            {membershipUrl}
          </a>
        </p>
      </div>
    </div>
  );
}
