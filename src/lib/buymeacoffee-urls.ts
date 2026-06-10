import type { CreditPlan } from "./pricing-plans";

const BMC_USERNAME = process.env.NEXT_PUBLIC_BMC_USERNAME ?? "";
const BMC_MEMBERSHIP_BASE =
  process.env.NEXT_PUBLIC_BMC_MEMBERSHIP_URL ??
  (BMC_USERNAME ? `https://buymeacoffee.com/${BMC_USERNAME}/membership` : "");

export function getBmcUsername() {
  return BMC_USERNAME;
}

export function getBmcMembershipUrl() {
  return BMC_MEMBERSHIP_BASE || null;
}

export function buildBmcMembershipUrl(plan: CreditPlan, userEmail?: string) {
  if (!BMC_MEMBERSHIP_BASE || plan.id === "custom") return null;

  const note = userEmail ? encodeURIComponent(`GetIndexRocket: ${userEmail}`) : "";
  return note ? `${BMC_MEMBERSHIP_BASE}?note=${note}` : BMC_MEMBERSHIP_BASE;
}

export function buildBmcPaymentUrl(plan: CreditPlan, userEmail?: string) {
  if (plan.id !== "custom") {
    return buildBmcMembershipUrl(plan, userEmail);
  }

  if (!BMC_USERNAME) return null;

  const base = `https://buymeacoffee.com/${BMC_USERNAME}`;
  const note = userEmail ? encodeURIComponent(`GetIndexRocket: ${userEmail}`) : "";
  return note ? `${base}?note=${note}` : base;
}
