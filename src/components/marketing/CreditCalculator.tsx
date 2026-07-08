"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PricingPlanButton } from "@/components/marketing/PricingPlanButton";
import { CREDIT_PLANS } from "@/lib/pricing-plans";

const PAID_PLANS = CREDIT_PLANS.filter((p) => p.priceUsd > 0);

function recommendPlan(urlCount: number) {
  if (urlCount <= 0) return null;

  const sufficient = PAID_PLANS.filter((p) => p.credits >= urlCount);
  if (sufficient.length === 0) {
    return { plan: CREDIT_PLANS.find((p) => p.id === "custom")!, fit: "custom" as const };
  }

  const byValue = [...sufficient].sort((a, b) => a.priceUsd / a.credits - b.priceUsd / b.credits);
  return { plan: byValue[0], fit: "plan" as const };
}

export function CreditCalculator() {
  const [urls, setUrls] = useState(75);

  const result = useMemo(() => {
    const rec = recommendPlan(urls);
    if (!rec) return null;

    if (rec.fit === "custom") {
      return {
        planName: "Custom Plan",
        planId: "custom",
        monthly: null as number | null,
        credits: null as number | null,
        costPerUrl: null as number | null,
        leftover: null as number | null,
        isCustom: true,
      };
    }

    const { plan } = rec;
    return {
      planName: plan.name,
      planId: plan.id,
      monthly: plan.priceUsd,
      credits: plan.credits,
      costPerUrl: Math.round((plan.priceUsd / plan.credits) * 100) / 100,
      leftover: plan.credits - urls,
      isCustom: false,
    };
  }, [urls]);

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 md:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <p className="eyebrow">Credit calculator</p>
          <h2 className="section-title mt-1">How many URLs per month?</h2>
          <p className="section-desc mt-2">
            Slide to your monthly volume — we&apos;ll recommend the best-value plan.
          </p>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="url-slider" className="text-sm font-medium text-[var(--muted)]">
                URLs / month
              </label>
              <input
                id="url-count"
                type="number"
                min={1}
                max={2000}
                value={urls}
                onChange={(e) => setUrls(Math.max(1, Math.min(2000, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-[var(--card-border)] bg-[var(--bg2)] px-3 py-1.5 text-right text-sm font-semibold tabular-nums outline-none focus:border-[var(--blue)]"
              />
            </div>
            <input
              id="url-slider"
              type="range"
              min={1}
              max={500}
              value={Math.min(urls, 500)}
              onChange={(e) => setUrls(Number(e.target.value))}
              className="mt-4 w-full accent-[var(--blue)]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[var(--muted2)]">
              <span>1</span>
              <span>500+</span>
            </div>
          </div>
        </div>

        {result && (
          <div className="w-full rounded-2xl border border-[var(--blue-22)] bg-gradient-to-br from-[var(--blue-08)] to-[var(--bg2)] p-6 lg:max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--blue)]">Recommended</p>
            <p className="mt-2 text-2xl font-bold">{result.planName}</p>

            {result.isCustom ? (
              <>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  For {urls}+ URLs/month, contact us for volume pricing and dedicated support.
                </p>
                <Link
                  href="mailto:support@getindexrocket.com"
                  className="btn btn-primary btn-md btn-block mt-6"
                >
                  Contact sales
                </Link>
              </>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--muted2)]">Monthly</p>
                    <p className="stat-value text-lg font-bold">${result.monthly}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--muted2)]">Per URL</p>
                    <p className="stat-value text-lg font-bold">${result.costPerUrl}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--muted2)]">Credits</p>
                    <p className="stat-value text-lg font-bold">{result.credits}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--muted2)]">Left over</p>
                    <p className="stat-value text-lg font-bold">{result.leftover}</p>
                  </div>
                </div>
                <PricingPlanButton planId={result.planId} label={`Start with ${result.planName}`} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
