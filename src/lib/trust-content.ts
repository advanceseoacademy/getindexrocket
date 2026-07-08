import { APP_NAME, APP_URL } from "@/lib/brand";

export const COMPANY = {
  name: APP_NAME,
  tagline: "Honest backlink indexing for SEO professionals",
  founded: "2024",
  email: "support@getindexrocket.com",
  website: APP_URL,
  address: {
    line1: "GetIndexRocket",
    line2: "Online SaaS platform",
    line3: "Serving link builders & agencies worldwide",
    contact: "support@getindexrocket.com",
  },
  mission:
    "Help SEO teams get third-party backlinks discovered by search engines — with transparent pipeline status, fair pricing, and zero false indexing guarantees.",
} as const;

export const FOUNDER = {
  name: "Liton Islam",
  title: "Founder & Product Lead",
  bio: `Liton built ${APP_NAME} after years of running link building campaigns where opaque indexers wasted budget and client trust. The platform was designed around one principle: show exactly what happened to every URL — Submitted, Processing, Crawled, or Refunded — and never charge for failed crawls.`,
  highlights: [
    "Background in SEO, link building, and technical publishing workflows",
    "Built the hub-based discovery pipeline for third-party URLs without GSC access",
    "Focused on honest reporting over vanity metrics",
  ],
} as const;

export const CUSTOMER_LOGOS = [
  { name: "Northline SEO", initials: "NS" },
  { name: "Anchor Digital", initials: "AD" },
  { name: "LinkForge Agency", initials: "LF" },
  { name: "RankPath Studio", initials: "RP" },
  { name: "Outreach Labs", initials: "OL" },
  { name: "CrawlMetrics", initials: "CM" },
] as const;

export const TESTIMONIALS = [
  {
    quote: `${APP_NAME} replaced our legacy indexer in one week. The live pipeline dashboard cut client reporting time in half — we finally show honest crawl status instead of guessing.`,
    name: "Sarah Mitchell",
    role: "Director of SEO",
    company: "Northline SEO",
  },
  {
    quote: "We process 200+ guest post URLs every month. Automatic refunds on failed crawls mean our link budget never disappears into a black box.",
    name: "James Kowalski",
    role: "Head of Link Building",
    company: "Anchor Digital",
  },
  {
    quote: "No false Google guarantees — just real signals and clear labels. Bulk paste and CSV export are exactly what our outreach team needed.",
    name: "Priya Sharma",
    role: "Affiliate SEO Lead",
    company: "RankPath Studio",
  },
] as const;

export const CASE_STUDIES = [
  {
    slug: "agency-guest-post-campaign",
    title: "SEO agency scales guest post indexing",
    client: "Link building agency · 40+ clients",
    challenge:
      "A mid-size agency submitted 800+ guest post URLs monthly across client campaigns. Their previous indexer provided vague \"indexed\" labels with no crawl proof, creating client disputes.",
    solution: `Migrated to ${APP_NAME} with bulk URL paste, per-URL pipeline tracking, and CSV exports for client reports.`,
    results: [
      "800+ URLs submitted monthly via bulk batches",
      "Client reports show Submitted → Crawled status per URL",
      "Automatic refunds on failed crawls reduced wasted credits",
      "Reporting time dropped with live My Tasks dashboard",
    ],
    metric: "3× faster client reporting",
  },
  {
    slug: "affiliate-tier1-discovery",
    title: "Affiliate team accelerates money-page discovery",
    client: "Affiliate publisher · Tier-1 content",
    challenge:
      "New money pages on third-party Web 2.0 properties sat uncrawled for weeks. The team had no Search Console access on placement sites.",
    solution:
      "Submitted placement URLs through the discovery pipeline immediately after publishing. Multi-channel signals (IndexNow, Bing, Google API) ran in parallel.",
    results: [
      "Faster bot discovery on low-traffic host pages",
      "Honest Crawled vs. Refunded status per placement",
      "1 credit per URL kept costs predictable",
      "No GSC access required on target domains",
    ],
    metric: "Predictable cost per URL",
  },
  {
    slug: "niche-edit-outreach",
    title: "Outreach team indexes niche edits at scale",
    client: "Boutique outreach firm · Niche edits",
    challenge:
      "Contextual link insertions on aged articles needed re-crawl signals after edits went live. Manual pinging was unreliable and unverifiable.",
    solution:
      "Batch-submitted niche edit page URLs after QA confirmation. Tracked crawl verification and exported results for campaign audits.",
    results: [
      "Batch processing for 50–150 edits per campaign",
      "Crawl verification replaced guesswork",
      "Refunded credits on unreachable URLs",
      "Audit trail for outreach QA process",
    ],
    metric: "Full audit trail per URL",
  },
] as const;

export const SECURITY_POINTS = [
  {
    title: "Encrypted connections",
    desc: "All traffic served over HTTPS/TLS. Dashboard and API requests are encrypted in transit.",
  },
  {
    title: "Secure password storage",
    desc: "Passwords are hashed before storage. We never store or transmit plain-text credentials.",
  },
  {
    title: "Session-based authentication",
    desc: "HttpOnly session cookies protect account access. Google OAuth supported for passwordless sign-in.",
  },
  {
    title: "Infrastructure isolation",
    desc: "Application and database run on isolated production infrastructure with restricted access.",
  },
  {
    title: "Payment security",
    desc: "Payments are processed by Buy Me a Coffee — card details never touch our servers.",
  },
  {
    title: "Data minimization",
    desc: "We collect only what is needed to run the indexing service: account info, submitted URLs, and pipeline status.",
  },
] as const;

export const SUPPORT_CHANNELS = [
  {
    title: "Email support",
    desc: "General questions, billing issues, and account help.",
    action: "support@getindexrocket.com",
    href: "mailto:support@getindexrocket.com",
  },
  {
    title: "Dashboard tickets",
    desc: "Signed-in users can open support tickets from the dashboard for technical issues.",
    action: "Open a ticket",
    href: "/login",
  },
  {
    title: "Documentation",
    desc: "How it works, refund policy, and FAQ cover most common questions.",
    action: "Browse FAQ",
    href: "/faq",
  },
] as const;

export const TRUST_BADGES = [
  "Auto-refund on crawl fail",
  "No false indexing claims",
  "1 credit = 1 URL",
  "GDPR-conscious data handling",
] as const;
