export type CreditPlan = {
  id: string;
  name: string;
  priceUsd: number;
  credits: number;
  maxLinks: number;
  bonusCredits?: number;
  features: string[];
  badge?: string;
  highlight?: boolean;
  bmcSlug?: string;
};

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceUsd: 10,
    credits: 50,
    maxLinks: 50,
    features: ["50 Credits", "Process up to 50 Links", "Standard Support"],
    bmcSlug: "starter-50-credits",
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 20,
    credits: 110,
    maxLinks: 110,
    bonusCredits: 10,
    badge: "Popular",
    highlight: true,
    features: [
      "110 Credits",
      "Process up to 110 Links",
      "Priority Processing",
      "★ 10 Bonus Credits",
    ],
    bmcSlug: "pro-110-credits",
  },
  {
    id: "agency",
    name: "Agency",
    priceUsd: 50,
    credits: 270,
    maxLinks: 270,
    bonusCredits: 20,
    features: [
      "270 Credits",
      "Process up to 270 Links",
      "Priority Processing",
      "Bulk Processing Support",
      "★ 20 Bonus Credits",
    ],
    bmcSlug: "agency-270-credits",
  },
  {
    id: "custom",
    name: "Custom Plan",
    priceUsd: 0,
    credits: 0,
    maxLinks: 0,
    features: [
      "Choose Any Credit Amount",
      "Flexible Pricing",
      "Suitable for Large Projects",
      "Dedicated Support",
    ],
    bmcSlug: "custom-credits",
  },
];

export function getPlanByAmount(amountUsd: number): CreditPlan | null {
  return CREDIT_PLANS.find((p) => p.priceUsd > 0 && p.priceUsd === amountUsd) ?? null;
}

export function getPlanByMembershipName(levelName?: string | null): CreditPlan | null {
  if (!levelName) return null;
  const normalized = levelName.toLowerCase().trim();
  return (
    CREDIT_PLANS.find(
      (p) =>
        p.id === normalized ||
        p.name.toLowerCase() === normalized ||
        normalized.includes(p.name.toLowerCase()),
    ) ?? null
  );
}

export function creditsForAmount(amountUsd: number, levelName?: string | null): number {
  const byLevel = getPlanByMembershipName(levelName);
  if (byLevel && byLevel.credits > 0) return byLevel.credits;

  const plan = getPlanByAmount(amountUsd);
  if (plan) return plan.credits;
  if (amountUsd <= 0) return 0;
  return Math.floor(amountUsd * 5);
}
