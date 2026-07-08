import { APP_NAME } from "@/lib/brand";
import type { IconName } from "@/components/ui/Icon";

export const TRUST_STATS = [
  { value: "10,000+", label: "URLs submitted per batch" },
  { value: "1 credit", label: "Per backlink — no hidden fees" },
  { value: "15 days", label: "Auto-refund if crawl fails" },
  { value: "3 channels", label: "IndexNow, Bing & Google signals" },
] as const;

export const FEATURE_CARDS: ReadonlyArray<{ icon: IconName; title: string; desc: string }> = [
  {
    icon: "link",
    title: "Third-party backlinks only",
    desc: "Guest posts, niche edits, Web 2.0, and forum links — no Google Search Console access on the target site required.",
  },
  {
    icon: "broadcast",
    title: "Multi-channel discovery",
    desc: "Hub pages push signals through IndexNow, Bing Webmaster, and Google Indexing API for faster bot discovery.",
  },
  {
    icon: "chart",
    title: "Live pipeline dashboard",
    desc: "Every URL shows a real status: Submitted → Processing → Crawled or Refunded. No black-box guessing.",
  },
  {
    icon: "clipboard",
    title: "Bulk paste & export",
    desc: "Submit up to 10,000 URLs at once. Export CSV reports for clients and campaign tracking.",
  },
  {
    icon: "credit-card",
    title: "Pay only for what you use",
    desc: "1 credit = 1 URL. Credits stay on your account. No monthly lock-in beyond your membership pack.",
  },
  {
    icon: "shield",
    title: "Automatic credit protection",
    desc: "Crawl verification fails? Credit returns instantly — no support ticket, no waiting period.",
  },
];

export const HOW_IT_WORKS: ReadonlyArray<{ icon: IconName; step: string; title: string; desc: string }> = [
  {
    icon: "pencil",
    step: "01",
    title: "Paste your backlink URLs",
    desc: "Drop guest post, niche edit, or outreach URLs into the dashboard. One credit per link.",
  },
  {
    icon: "rocket",
    step: "02",
    title: "We create discovery hubs",
    desc: `${APP_NAME} builds hub pages on our domain and submits them to search engines — legally and transparently.`,
  },
  {
    icon: "bot",
    step: "03",
    title: "Bots crawl & follow links",
    desc: "Googlebot and Bingbot discover the hub, follow the link, and find your third-party backlink page.",
  },
  {
    icon: "check-circle",
    step: "04",
    title: "Track honest results",
    desc: "See live status in My Tasks. Crawled means a bot visited. Refunded means you get your credit back.",
  },
];

export const COMPARISON_ROWS = [
  { feature: "Third-party URL support", us: true, them: "Limited" },
  { feature: "No GSC access needed", us: true, them: false },
  { feature: "Live pipeline status", us: true, them: "Opaque" },
  { feature: "Auto refund on crawl fail", us: true, them: "Rare" },
  { feature: "Pay per URL (1 credit)", us: true, them: "Bundled pricing" },
  { feature: "Honest status labels", us: true, them: '"Indexed" claims' },
  { feature: "Bulk submit (10K URLs)", us: true, them: "Varies" },
] as const;

export const USE_CASES: ReadonlyArray<{ icon: IconName; title: string; desc: string }> = [
  {
    icon: "link",
    title: "Link builders",
    desc: "Index guest posts and outreach placements without asking site owners for Search Console access.",
  },
  {
    icon: "building",
    title: "SEO agencies",
    desc: "Run bulk campaigns, track client URLs, and export honest pipeline reports they can trust.",
  },
  {
    icon: "coins",
    title: "Affiliate marketers",
    desc: "Push new money pages and tier-1 content through discovery faster after publishing.",
  },
];
