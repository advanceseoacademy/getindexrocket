import { APP_NAME } from "@/lib/brand";

export type LandingSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LandingFaq = { q: string; a: string };

export type LandingPage = {
  slug: string;
  breadcrumbLabel: string;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  h1: string;
  lead: string;
  sections: LandingSection[];
  faq: LandingFaq[];
  cta: {
    title: string;
    description: string;
  };
  relatedSlugs: string[];
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "backlink-indexing-service",
    breadcrumbLabel: "Backlink Indexing Service",
    meta: {
      title: "Backlink Indexing Service for Third-Party URLs",
      description: `Professional backlink indexing service for guest posts, niche edits, and outreach links. ${APP_NAME} — 1 credit per URL, live pipeline tracking, auto refund on crawl fail.`,
      keywords: [
        "backlink indexing service",
        "url indexing service",
        "third party backlink indexing",
        "seo indexing service",
        "link indexing platform",
      ],
    },
    h1: "Backlink Indexing Service Built for URLs You Don't Own",
    lead: `${APP_NAME} is a backlink indexing service designed for SEO professionals who need third-party URLs discovered by search engines — without Google Search Console access on the target site. Submit links, track honest pipeline status, and pay only 1 credit per URL.`,
    sections: [
      {
        id: "what-is",
        title: "What is a backlink indexing service?",
        paragraphs: [
          "A backlink indexing service helps search engines discover pages that contain links pointing to your site. When you earn a guest post, niche edit, or outreach placement on a domain you do not control, Google and Bing may take weeks to crawl that page — if they find it at all.",
          `${APP_NAME} solves this by running a structured discovery pipeline: you submit the backlink URL, we create discovery hubs on our domain, push signals through IndexNow, Bing Webmaster, and Google Indexing API, and show you exactly what happened in a live dashboard.`,
        ],
      },
      {
        id: "who-needs",
        title: "Who needs professional backlink indexing?",
        paragraphs: [
          "Link builders, SEO agencies, and affiliate marketers submit hundreds of third-party URLs every month. Without a reliable indexing service, campaigns stall because bots never reach new placements.",
        ],
        bullets: [
          "Guest post and contributor article URLs on blogs you don't own",
          "Niche edit and contextual link placements on existing pages",
          "Web 2.0, forum, and directory backlinks from outreach campaigns",
          "Client reporting where you need transparent pipeline status",
        ],
      },
      {
        id: "how-different",
        title: "How our indexing service is different",
        paragraphs: [
          "Many indexing services promise guaranteed Google indexing — which no honest provider can deliver. We show real status labels: Submitted, Processing, Crawled, or Refunded. If crawl verification fails, your credit returns automatically.",
          "Pricing is transparent: 1 credit equals 1 URL. No hidden API fees, no per-seat charges, and no black-box dashboards.",
        ],
      },
      {
        id: "workflow",
        title: "How the service works end to end",
        paragraphs: [
          "Create an account, purchase credits via monthly membership, paste your backlink URLs (one per line for bulk), and monitor My Tasks for live updates. Export CSV reports for clients when campaigns complete.",
        ],
        bullets: [
          "Submit single URLs or batches up to 10,000 at once",
          "Discovery hubs created on getindexrocket.com linking to your target",
          "Multi-channel signals: IndexNow, Bing, and Google APIs",
          "Automatic credit refund when crawl verification fails",
        ],
      },
    ],
    faq: [
      {
        q: "Does your backlink indexing service guarantee Google indexing?",
        a: `No. ${APP_NAME} sends real discovery signals and verifies crawls honestly. We never promise guaranteed indexing — that would be misleading. You see Submitted, Processing, Crawled, or Refunded for every URL.`,
      },
      {
        q: "How much does the backlink indexing service cost?",
        a: "1 credit = 1 URL. Starter membership is $10 for 50 credits, Pro is $20 for 110 credits, and Agency is $50 for 270 credits per month.",
      },
      {
        q: "Can I use this service for client campaigns?",
        a: "Yes. Agencies use bulk submission, live status tracking, and CSV export to report honest pipeline data to clients without false indexing claims.",
      },
      {
        q: "What happens if a URL fails to get crawled?",
        a: "The URL is marked Refunded and 1 credit is automatically returned to your account. No support ticket required.",
      },
    ],
    cta: {
      title: "Start using our backlink indexing service",
      description: "Create a free account and submit your first third-party backlink URL in under a minute.",
    },
    relatedSlugs: ["backlink-indexer", "guest-post-indexing", "bulk-url-indexing"],
  },
  {
    slug: "backlink-indexer",
    breadcrumbLabel: "Backlink Indexer",
    meta: {
      title: "Backlink Indexer — Fast Third-Party URL Discovery",
      description: `Honest backlink indexer for guest posts and outreach links. Live pipeline status, bulk submit, 1 credit per URL. Try ${APP_NAME} today.`,
      keywords: [
        "backlink indexer",
        "link indexer",
        "url indexer",
        "backlink indexing tool",
        "index backlinks fast",
      ],
    },
    h1: "The Backlink Indexer SEO Teams Trust for Honest Results",
    lead: `Looking for a backlink indexer that doesn't hide behind fake "indexed" labels? ${APP_NAME} processes third-party URLs through a transparent discovery pipeline — with live status, bulk paste, and automatic refunds when crawls fail.`,
    sections: [
      {
        id: "indexer-vs-service",
        title: "Backlink indexer vs. generic URL tools",
        paragraphs: [
          "Generic URL submitters often require you to own the domain or verify it in Google Search Console. A true backlink indexer is built for the opposite case: URLs on sites you cannot verify.",
          `${APP_NAME} focuses exclusively on third-party backlinks — guest posts, niche edits, Web 2.0 properties, and outreach placements where you have no admin access.`,
        ],
      },
      {
        id: "pipeline",
        title: "Inside the indexer pipeline",
        paragraphs: [
          "When you submit a URL, our indexer creates a discovery hub page on our domain that links to your target. Search bots crawl the hub, follow the outbound link, and discover your backlink page. Parallel signals go to IndexNow, Bing Webmaster, and Google Indexing API.",
        ],
        bullets: [
          "Hub pages on getindexrocket.com — crawlable and transparent",
          "Bot detection restricted to real search engine user agents",
          "Status updates: Submitted → Processing → Crawled or Refunded",
          "No GSC access required on the target domain",
        ],
      },
      {
        id: "bulk",
        title: "Bulk indexing for link building teams",
        paragraphs: [
          "Paste up to 10,000 URLs per batch from your dashboard. Each valid HTTP/HTTPS URL costs 1 credit. Link builders running monthly outreach campaigns rely on bulk mode to process guest post lists without manual one-by-one submission.",
        ],
      },
      {
        id: "trust",
        title: "Why teams switch to this indexer",
        paragraphs: [
          "Traditional indexers often report vague success without proof. Our indexer shows crawl verification results and refunds credits when the host is unreachable — so you never pay for dead links.",
        ],
      },
    ],
    faq: [
      {
        q: "Is GetIndexRocket a backlink indexer or a rank tracker?",
        a: `${APP_NAME} is a backlink indexer — we help search engines discover third-party URLs containing your links. We do not track keyword rankings or domain authority.`,
      },
      {
        q: "Can this indexer handle guest post URLs?",
        a: "Yes. Guest posts on blogs, Medium-style platforms, WordPress.com, and Blogger are common submission types.",
      },
      {
        q: "How fast does the indexer process URLs?",
        a: "Submission is instant. Discovery signals are sent in parallel. Crawl verification timing depends on search engine bots — we show live status as the pipeline progresses.",
      },
      {
        q: "Do I need to install anything?",
        a: "No. The indexer runs entirely in the cloud. Submit URLs from your browser dashboard.",
      },
    ],
    cta: {
      title: "Try the backlink indexer free",
      description: "Sign up, add credits, and index your first outreach URL with full pipeline visibility.",
    },
    relatedSlugs: ["backlink-indexing-service", "link-discovery", "google-crawl-service"],
  },
  {
    slug: "guest-post-indexing",
    breadcrumbLabel: "Guest Post Indexing",
    meta: {
      title: "Guest Post Indexing — Get Outreach Articles Crawled Faster",
      description: `Index guest post backlinks without GSC access. Submit contributor URLs, track crawl status, 1 credit per guest post. ${APP_NAME}.`,
      keywords: [
        "guest post indexing",
        "index guest posts",
        "guest post seo",
        "contributor post indexing",
        "guest blogging indexing",
      ],
    },
    h1: "Guest Post Indexing for Contributor Articles & Outreach Placements",
    lead: `You published a guest post — now Google needs to find it. ${APP_NAME} indexes guest post URLs on third-party blogs so search bots discover your contributor articles faster, with honest crawl tracking and 1 credit per URL.`,
    sections: [
      {
        id: "problem",
        title: "Why guest posts get crawled slowly",
        paragraphs: [
          "New guest posts often live on low-traffic blogs with weak internal linking. Googlebot may not revisit those domains frequently, so your backlink sits undiscovered for weeks. You cannot add the URL to Search Console because you do not own the site.",
          "Guest post indexing bridges that gap by sending structured discovery signals and creating crawl paths bots can follow.",
        ],
      },
      {
        id: "types",
        title: "Guest post URL types we support",
        paragraphs: [
          "Submit any valid public HTTP/HTTPS URL where your guest article or contributor post is published.",
        ],
        bullets: [
          "Niche blogs and industry publications",
          "Blogspot / Blogger and WordPress.com articles",
          "Medium-style platforms and Web 2.0 blogs",
          "Digital PR and press release placements",
        ],
      },
      {
        id: "workflow",
        title: "How guest post indexing works",
        paragraphs: [
          "Paste your guest post URL into the dashboard. One credit is deducted per URL. Our system builds a discovery hub, submits signals to search engines, and verifies whether bots successfully crawled the page.",
          "If crawl verification fails within the processing window, the URL is marked Refunded and your credit returns automatically.",
        ],
      },
      {
        id: "agencies",
        title: "Guest post indexing for agencies",
        paragraphs: [
          "Agencies managing multiple client link building campaigns use bulk paste to submit dozens of guest post URLs at once. CSV export provides audit trails for client reports — showing Submitted, Processing, Crawled, or Refunded status per URL.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I index a guest post without the site owner's permission?",
        a: "You should only submit URLs you have the right to promote. Indexing sends discovery signals — it does not modify the target site.",
      },
      {
        q: "Does guest post indexing guarantee the link passes PageRank?",
        a: "No service can guarantee ranking impact. We help bots discover the page; Google's indexing and ranking decisions are independent.",
      },
      {
        q: "How many guest posts can I submit at once?",
        a: "Up to 10,000 URLs per batch. Each guest post URL costs 1 credit.",
      },
      {
        q: "What if my guest post URL is on a slow or new blog?",
        a: "That is exactly when indexing helps most. Discovery signals push bots toward pages they might otherwise miss.",
      },
    ],
    cta: {
      title: "Index your guest posts today",
      description: "Submit contributor article URLs and track crawl status in one dashboard.",
    },
    relatedSlugs: ["niche-edit-indexing", "backlink-indexing-service", "bulk-url-indexing"],
  },
  {
    slug: "niche-edit-indexing",
    breadcrumbLabel: "Niche Edit Indexing",
    meta: {
      title: "Niche Edit Indexing — Contextual Link Discovery",
      description: `Index niche edit and contextual backlink URLs. No GSC required. Live crawl tracking, auto refund on fail. ${APP_NAME} — 1 credit per URL.`,
      keywords: [
        "niche edit indexing",
        "contextual link indexing",
        "niche edit seo",
        "index niche edits",
        "editorial link indexing",
      ],
    },
    h1: "Niche Edit Indexing for Contextual & Editorial Backlinks",
    lead: `Niche edits place your link inside existing, aged content — but only if search engines crawl that page. ${APP_NAME} indexes niche edit URLs so Googlebot and Bingbot discover contextual placements on third-party sites you don't control.`,
    sections: [
      {
        id: "what",
        title: "What is niche edit indexing?",
        paragraphs: [
          "A niche edit (or contextual link insertion) adds your backlink to an already-published article on someone else's domain. These pages often have existing authority, but if the edit is recent, bots may not recrawl the updated page quickly.",
          "Niche edit indexing submits the specific page URL through a discovery pipeline so search engines find the updated content and register your new link.",
        ],
      },
      {
        id: "difference",
        title: "Niche edits vs. guest posts for indexing",
        paragraphs: [
          "Guest posts are new pages; niche edits are modifications to existing URLs. Both require third-party indexing because you lack Search Console access. Niche edits can be faster to rank if the host page is already indexed — but the updated URL still needs a fresh crawl.",
        ],
        bullets: [
          "Submit the exact page URL where your link was inserted",
          "Works on editorial blogs, resource pages, and aged articles",
          "Ideal after outreach teams confirm the edit is live",
          "1 credit per niche edit URL — same simple pricing",
        ],
      },
      {
        id: "signals",
        title: "Discovery signals for contextual links",
        paragraphs: [
          `${APP_NAME} creates hub pages linking to your niche edit URL and broadcasts discovery signals through IndexNow, Bing Webmaster API, and Google Indexing API. You see honest pipeline status instead of a vague "indexed" checkbox.`,
        ],
      },
      {
        id: "refunds",
        title: "Credit protection on failed crawls",
        paragraphs: [
          "If the niche edit page is unreachable or crawl verification fails, your URL is marked Refunded and 1 credit returns to your balance instantly. You never lose credits on dead or broken contextual links.",
        ],
      },
    ],
    faq: [
      {
        q: "Should I submit the homepage or the specific niche edit page?",
        a: "Always submit the exact URL where your contextual link appears — not the domain homepage.",
      },
      {
        q: "Can I bulk submit niche edit URLs?",
        a: "Yes. Paste multiple niche edit page URLs (one per line), up to 10,000 per batch.",
      },
      {
        q: "Does niche edit indexing work on aged authority pages?",
        a: "Yes. Aged pages benefit from re-crawl signals when new links are added. Indexing prompts bots to revisit the updated content.",
      },
      {
        q: "Is niche edit indexing the same as link insertion services?",
        a: "Indexing is separate from placement. We help search engines discover URLs you already have — we do not broker niche edit deals.",
      },
    ],
    cta: {
      title: "Index your niche edit URLs",
      description: "Push contextual backlink pages through discovery and track every crawl result.",
    },
    relatedSlugs: ["guest-post-indexing", "backlink-indexer", "link-discovery"],
  },
  {
    slug: "bulk-url-indexing",
    breadcrumbLabel: "Bulk URL Indexing",
    meta: {
      title: "Bulk URL Indexing — Submit 10,000 Backlinks at Once",
      description: `Bulk URL indexing for link building campaigns. Paste up to 10,000 URLs per batch, 1 credit each, CSV export. ${APP_NAME}.`,
      keywords: [
        "bulk url indexing",
        "bulk backlink indexing",
        "mass url submission",
        "bulk link indexing",
        "batch url indexing",
      ],
    },
    h1: "Bulk URL Indexing for Large-Scale Link Building Campaigns",
    lead: `Running a campaign with hundreds of outreach URLs? ${APP_NAME} bulk URL indexing lets you paste up to 10,000 backlink URLs per batch, track each one individually, and export results — 1 credit per URL, no volume penalties.`,
    sections: [
      {
        id: "scale",
        title: "Built for scale without sacrificing visibility",
        paragraphs: [
          "Bulk URL indexing is not a black box. Every URL in your batch gets its own pipeline status: Submitted, Processing, Crawled, or Refunded. You can refresh My Tasks anytime to pull the latest update.",
          "Agencies processing client backlink lists weekly rely on bulk mode to avoid repetitive one-by-one submissions.",
        ],
      },
      {
        id: "how-to",
        title: "How to submit URLs in bulk",
        paragraphs: [
          "Open the Submit page or dashboard, paste your URL list with one URL per line, and confirm submission. Invalid or malformed URLs are rejected; valid URLs deduct 1 credit each from your balance.",
        ],
        bullets: [
          "Maximum 10,000 URLs per submission batch",
          "HTTP and HTTPS public URLs supported",
          "Duplicate detection prevents double-charging",
          "CSV export for campaign reporting",
        ],
      },
      {
        id: "pricing",
        title: "Bulk indexing pricing",
        paragraphs: [
          "There is no separate bulk tier. 1 credit = 1 URL whether you submit one link or ten thousand. Agency membership ($50/month) provides 270 credits — ideal for teams running regular bulk campaigns.",
        ],
      },
      {
        id: "refunds",
        title: "Automatic refunds in bulk campaigns",
        paragraphs: [
          "When individual URLs in a bulk batch fail crawl verification, only those URLs are refunded — not the entire batch. Successful crawls keep their credit usage; failed ones return instantly.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the maximum batch size for bulk URL indexing?",
        a: "10,000 URLs per submission. For larger campaigns, submit multiple batches.",
      },
      {
        q: "Can I export bulk indexing results?",
        a: "Yes. Export CSV from My Tasks with URL, status, and timestamps for client reporting.",
      },
      {
        q: "Does bulk submission slow down processing?",
        a: "Submissions are queued and processed on schedule. Each URL moves through the pipeline independently with its own status.",
      },
      {
        q: "What file format should my URL list use?",
        a: "Plain text, one URL per line. No commas or spreadsheets required — paste directly into the dashboard.",
      },
    ],
    cta: {
      title: "Start bulk URL indexing",
      description: "Paste your backlink list and process thousands of URLs with per-URL status tracking.",
    },
    relatedSlugs: ["backlink-indexing-service", "guest-post-indexing", "backlink-indexer"],
  },
  {
    slug: "link-discovery",
    breadcrumbLabel: "Link Discovery",
    meta: {
      title: "Link Discovery — Help Search Engines Find Your Backlinks",
      description: `Accelerate link discovery for third-party backlinks. Multi-channel signals, hub pages, live tracking. ${APP_NAME} — honest SEO discovery.`,
      keywords: [
        "link discovery",
        "backlink discovery",
        "search engine discovery",
        "url discovery seo",
        "discover backlinks google",
      ],
    },
    h1: "Link Discovery for Third-Party Backlinks Search Engines Miss",
    lead: `Link discovery is the process of helping search bots find pages that contain your backlinks. ${APP_NAME} accelerates discovery for guest posts, niche edits, and outreach URLs through hub pages, IndexNow, Bing, and Google indexing signals.`,
    sections: [
      {
        id: "why",
        title: "Why link discovery matters for SEO",
        paragraphs: [
          "A backlink only contributes to SEO after search engines crawl the page containing it. Low-authority blogs, new guest posts, and niche edits on rarely-updated sites often sit undiscovered for weeks.",
          "Proactive link discovery sends signals that guide Googlebot and Bingbot toward those pages — reducing the gap between placement and crawl.",
        ],
      },
      {
        id: "channels",
        title: "Multi-channel discovery architecture",
        paragraphs: [
          `${APP_NAME} does not rely on a single method. Discovery runs in parallel across multiple channels for maximum reach.`,
        ],
        bullets: [
          "Hub pages on getindexrocket.com with follow links to your target URL",
          "IndexNow protocol for instant search engine notification",
          "Bing Webmaster API submission for Microsoft search discovery",
          "Google Indexing API signals where configured",
        ],
      },
      {
        id: "honest",
        title: "Honest discovery — not false promises",
        paragraphs: [
          "We describe outcomes accurately. Discovery means bots are guided to your URL; it does not mean guaranteed indexing or ranking improvements. Your dashboard shows what actually happened — Crawled means a bot visited, Refunded means crawl verification failed.",
        ],
      },
      {
        id: "use-cases",
        title: "When to prioritize link discovery",
        paragraphs: [
          "Link discovery is most valuable right after new placements go live — guest posts published this week, niche edits confirmed yesterday, or outreach batches completed over the weekend. Early discovery reduces the waiting period before links can influence rankings.",
        ],
      },
    ],
    faq: [
      {
        q: "Is link discovery the same as link building?",
        a: "No. Link building earns placements; link discovery helps search engines find those placements after they exist.",
      },
      {
        q: "How is link discovery different from pinging?",
        a: "Simple pings notify services once. Our pipeline includes hub pages, multi-API signals, crawl verification, and status tracking.",
      },
      {
        q: "Can link discovery help old backlinks?",
        a: "Yes. Re-submitting aged URLs can trigger fresh crawl signals, though already-indexed pages may not need rediscovery.",
      },
      {
        q: "Do you guarantee Google will index discovered links?",
        a: "No. We accelerate discovery and report honest crawl results. Indexing decisions remain with search engines.",
      },
    ],
    cta: {
      title: "Accelerate link discovery now",
      description: "Submit backlink URLs and push multi-channel discovery signals today.",
    },
    relatedSlugs: ["google-crawl-service", "backlink-indexer", "niche-edit-indexing"],
  },
  {
    slug: "google-crawl-service",
    breadcrumbLabel: "Google Crawl Service",
    meta: {
      title: "Google Crawl Service for Third-Party Backlink URLs",
      description: `Help Googlebot discover backlink pages faster. Crawl verification, live status, auto refund on fail. ${APP_NAME} — 1 credit per URL.`,
      keywords: [
        "google crawl service",
        "get google to crawl url",
        "googlebot crawl backlink",
        "google indexing crawl",
        "crawl verification service",
      ],
    },
    h1: "Google Crawl Service for Backlink Pages Bots Haven't Visited",
    lead: `Need Googlebot to find a third-party page containing your backlink? ${APP_NAME} provides a structured crawl service: discovery hubs, Google Indexing API signals, crawl verification, and transparent status — without requiring Search Console on the target domain.`,
    sections: [
      {
        id: "crawl-vs-index",
        title: "Crawl vs. index — what we actually deliver",
        paragraphs: [
          "Crawling means Googlebot (or another search bot) visited and fetched your URL. Indexing means Google chose to include that page in its search index. These are separate steps.",
          `${APP_NAME} focuses on crawl discovery and verification. When our system confirms a bot visited your URL, status shows Crawled. We do not claim guaranteed Google indexing.`,
        ],
      },
      {
        id: "how",
        title: "How our Google crawl service works",
        paragraphs: [
          "We create crawlable hub pages on our domain that link to your target backlink URL. Google Indexing API and complementary channels notify search systems. Bot user agents hitting the hub can follow the link to discover your page.",
        ],
        bullets: [
          "Hub strategy works for URLs you don't own",
          "Google Indexing API + IndexNow + Bing signals in parallel",
          "Crawl verification with restricted bot user-agent detection",
          "Refunded status + credit return when crawl fails",
        ],
      },
      {
        id: "gsc",
        title: "No Google Search Console required",
        paragraphs: [
          "Standard Google indexing tools require site ownership verification. Our crawl service is designed for third-party backlinks — guest posts, niche edits, and outreach placements where GSC access is impossible.",
        ],
      },
      {
        id: "tracking",
        title: "Track crawl results in real time",
        paragraphs: [
          "My Tasks shows live pipeline status for every submitted URL. Refresh to pull updates. Export CSV for audit trails. Agencies use crawl data to report which placements were actually visited by bots.",
        ],
      },
    ],
    faq: [
      {
        q: "Does this Google crawl service guarantee indexing?",
        a: "No. We help bots discover and crawl URLs. Whether Google indexes the page afterward is Google's decision.",
      },
      {
        q: "How do I know if Googlebot crawled my URL?",
        a: "When crawl verification succeeds, your URL status changes to Crawled in the dashboard.",
      },
      {
        q: "Can I use this for pages on my own website?",
        a: `${APP_NAME} is optimized for third-party URLs. For owned sites, Google Search Console URL Inspection is the standard tool.`,
      },
      {
        q: "What happens if Googlebot never crawls my URL?",
        a: "If crawl verification fails within the processing window, status becomes Refunded and your credit is returned automatically.",
      },
    ],
    cta: {
      title: "Submit URLs for Google crawl discovery",
      description: "Push third-party backlink pages through our crawl pipeline with full status visibility.",
    },
    relatedSlugs: ["link-discovery", "backlink-indexing-service", "guest-post-indexing"],
  },
];

export const LANDING_SLUGS = LANDING_PAGES.map((p) => p.slug);

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

export function getRelatedLandingPages(slugs: string[]): LandingPage[] {
  return slugs
    .map((s) => getLandingPage(s))
    .filter((p): p is LandingPage => p !== undefined);
}
