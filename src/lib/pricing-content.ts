import { APP_NAME } from "@/lib/brand";
import { COMPARISON_ROWS } from "@/lib/home-content";

export const PRICING_FAQ = [
  {
    q: "How much does each URL cost?",
    a: "1 credit = 1 URL. Starter includes 50 credits ($10/mo), Pro includes 110 credits ($20/mo), and Agency includes 270 credits ($50/mo). Larger volumes can use the Custom plan.",
  },
  {
    q: "Which plan should I choose?",
    a: "Use the credit calculator on this page — enter how many URLs you submit per month and we'll recommend the best value plan. Most growing teams start on Pro for the bonus credits and priority processing.",
  },
  {
    q: "Do credits expire?",
    a: "Credits stay on your account while your membership is active. If membership lapses, unused credits may be forfeited per our Terms of Service.",
  },
  {
    q: "What happens if a URL fails?",
    a: "If crawl verification fails, the URL is marked Refunded and your credit is returned automatically — no support ticket required.",
  },
  {
    q: "Can I submit bulk URLs?",
    a: "Yes. Paste up to 10,000 URLs per batch from your dashboard. Each valid HTTP/HTTPS URL costs 1 credit.",
  },
  {
    q: "Is there a free trial?",
    a: "Create a free account to explore the dashboard. Credits are purchased via membership — start with Starter at $10/mo if you're testing a small batch.",
  },
  {
    q: "Can I upgrade or change plans?",
    a: "Yes. Change your Buy Me a Coffee membership tier anytime. New credits are applied when your payment is processed.",
  },
  {
    q: "Do you offer enterprise or invoice billing?",
    a: `Yes. Teams indexing 500+ URLs per month can contact us at support@getindexrocket.com for custom volume pricing, dedicated support, and invoicing.`,
  },
] as const;

export const PLAN_COMPARISON = [
  { feature: "Monthly credits", starter: "50", pro: "110", agency: "270", custom: "Custom" },
  { feature: "Monthly price", starter: "$10", pro: "$20", agency: "$50", custom: "Flexible" },
  { feature: "Cost per URL", starter: "$0.20", pro: "$0.18", agency: "$0.19", custom: "Negotiated" },
  { feature: "Bonus credits", starter: "—", pro: "10 bonus", agency: "20 bonus", custom: "—" },
  { feature: "Bulk submit (10K/batch)", starter: true, pro: true, agency: true, custom: true },
  { feature: "Live pipeline tracking", starter: true, pro: true, agency: true, custom: true },
  { feature: "CSV export", starter: true, pro: true, agency: true, custom: true },
  { feature: "Auto refund on crawl fail", starter: true, pro: true, agency: true, custom: true },
  { feature: "Priority processing", starter: false, pro: true, agency: true, custom: true },
  { feature: "Bulk campaign support", starter: false, pro: false, agency: true, custom: true },
  { feature: "Dedicated support", starter: false, pro: false, agency: false, custom: true },
] as const;

export const REFUND_POLICY_POINTS = [
  {
    title: "Automatic credit return",
    desc: "When a URL fails crawl verification and is marked Refunded, 1 credit is added back to your balance instantly.",
  },
  {
    title: "No support ticket needed",
    desc: "Refunds happen in the dashboard automatically. You can verify every refund in your credit transaction history.",
  },
  {
    title: "Honest status labels",
    desc: "We never mark a URL as indexed without crawl proof. Refunded means the credit came back — not a vague failure.",
  },
  {
    title: "Membership payments",
    desc: "Membership fees are handled by Buy Me a Coffee. Credit refunds apply to failed URL submissions, not past membership charges.",
  },
] as const;

export const ENTERPRISE_FEATURES = [
  "Custom credit volumes (500+ URLs/mo)",
  "Volume pricing below standard tiers",
  "Dedicated onboarding & support",
  "Campaign reporting for client deliverables",
  "Invoice billing for agencies",
  "Priority pipeline processing",
] as const;

export const PRICING_TRUST_POINTS = [
  { label: "1 credit = 1 URL", desc: "Predictable cost per backlink" },
  { label: "Auto-refund policy", desc: "Credits back on crawl fail" },
  { label: "Cancel anytime", desc: "No long-term contracts" },
  { label: "Secure payments", desc: "Processed by Buy Me a Coffee" },
] as const;

export { COMPARISON_ROWS };

export const PRICING_HERO = {
  eyebrow: "Simple pricing",
  title: "Pay per URL. Track every result.",
  desc: `1 credit = 1 URL on every plan. Same core features across Starter, Pro, and Agency — pick the credit volume that matches your campaigns. ${APP_NAME} never charges for failed crawls.`,
} as const;
