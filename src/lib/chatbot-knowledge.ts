import { APP_NAME } from "@/lib/brand";
import { FAQ_ITEMS } from "@/components/marketing/faq-data";
import { PRICING_FAQ } from "@/lib/pricing-content";
import { COMPANY } from "@/lib/trust-content";

export type ChatLink = { label: string; href: string };

export type ChatKnowledge = {
  id: string;
  keywords: string[];
  /** Core facts — must match published site copy (FAQ, pricing, policies) */
  facts: string;
  replies?: string[];
  links?: ChatLink[];
};

const UNIQUE_FAQ = new Map<string, string>();
for (const item of [...FAQ_ITEMS, ...PRICING_FAQ]) {
  UNIQUE_FAQ.set(item.q, item.a);
}

function faq(id: string, question: string, links?: ChatLink[]): ChatKnowledge {
  const facts = UNIQUE_FAQ.get(question);
  if (!facts) throw new Error(`chatbot-knowledge: missing FAQ answer for "${question}"`);
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s?]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return {
    id,
    keywords: [question.toLowerCase().replace(/\?/g, "").trim(), ...keywords],
    facts,
    links,
  };
}

export const CHAT_BOT_NAME = "Sarah";
export const CHAT_BOT_ROLE = "Support specialist";

/** Standalone greetings only — no broad words like "help" (handled separately) */
export const CHAT_GREETINGS = [
  "hi",
  "hello",
  "hey",
  "salam",
  "assalamu alaikum",
  "salam alaikum",
  "good morning",
  "good afternoon",
  "good evening",
];

export const CHAT_QUICK_PROMPTS = [
  "How much per URL?",
  "What if crawl fails?",
  "How do I sign up?",
  "Can I paste bulk URLs?",
  "Talk to a human",
];

export const CHAT_SCOPE_HINT = `${APP_NAME} pricing, credits, refunds, bulk submit, dashboard, and account help.`;

export const CHAT_OUT_OF_SCOPE_FACTS = `I can only help with ${CHAT_SCOPE_HINT} For anything else, check our FAQ or email ${COMPANY.email}.`;

/** Curated aliases + Bangla — facts always from site content */
export const CHAT_KNOWLEDGE: ChatKnowledge[] = [
  {
    id: "greeting",
    keywords: CHAT_GREETINGS,
    facts: `I can help with ${CHAT_SCOPE_HINT}`,
    replies: [
      `Hey there! 👋 I'm ${CHAT_BOT_NAME} from ${APP_NAME}. I can answer questions about our pricing, credits, refunds, and how to submit URLs — what would you like to know?`,
      `Hi! I'm ${CHAT_BOT_NAME}. Ask me about ${APP_NAME} plans, bulk submit, or refunds — that's what I'm here for.`,
      `Assalamu alaikum! Welcome to ${APP_NAME}. I'm ${CHAT_BOT_NAME} — ask me about pricing, credits, or your account.`,
    ],
    links: [
      { label: "Create free account", href: "/register" },
      { label: "See pricing", href: "/pricing" },
    ],
  },
  faq("what-is", `What is ${APP_NAME}?`, [
    { label: "How it works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
  ]),
  {
    id: "pricing",
    keywords: [
      "price",
      "pricing",
      "cost",
      "credit",
      "plan",
      "starter",
      "pro",
      "agency",
      "how much",
      "per url",
      "dam",
      "koto",
      "দাম",
      "ক্রেডিট",
    ],
    facts: UNIQUE_FAQ.get("How much does each URL cost?")!,
    links: [
      { label: "Full pricing", href: "/pricing" },
      { label: "Get started", href: "/register" },
    ],
  },
  faq("which-plan", "Which plan should I choose?", [{ label: "Pricing calculator", href: "/pricing" }]),
  faq("free-trial", "Is there a free trial?", [{ label: "Create account", href: "/register" }]),
  faq("upgrade-plan", "Can I upgrade or change plans?", [{ label: "Pricing", href: "/pricing" }]),
  {
    id: "refund",
    keywords: [
      "refund",
      "failed",
      "crawl fail",
      "money back",
      "return credit",
      "auto refund",
      "15 days",
      "ফেরত",
      "ফেরত পাব",
    ],
    facts: UNIQUE_FAQ.get("What happens if a URL fails?")!,
    links: [{ label: "Refund policy", href: "/refund-policy" }],
  },
  faq("bulk", "Can I submit bulk URLs?", [{ label: "Sign up & try", href: "/register" }]),
  faq("gsc", "Can I index URLs on sites I don't own?"),
  faq("guarantee", `Does ${APP_NAME} guarantee Google indexing?`),
  {
    id: "signup",
    keywords: [
      "sign up",
      "register",
      "create account",
      "get started",
      "login",
      "sign in",
      "account",
      "খুলব",
      "অ্যাকাউন্ট",
    ],
    facts:
      "Create a free account with Google or email, then buy credits when you're ready. Sign in anytime from the header.",
    links: [
      { label: "Create account", href: "/register" },
      { label: "Sign in", href: "/login" },
    ],
  },
  faq("payment", "How do I pay for credits?", [{ label: "Pricing", href: "/pricing" }]),
  faq("expire", "Do credits expire?"),
  faq("track", "How do I track my submissions?", [{ label: "Sign in", href: "/login" }]),
  {
    id: "channels",
    keywords: ["indexnow", "bing", "google api", "google indexing", "discovery", "signals", "hub page"],
    facts:
      `${APP_NAME} pushes discovery signals through IndexNow, Bing Webmaster, and Google Indexing API. Hub pages on our domain help bots find your third-party backlink URLs.`,
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
    ],
  },
  {
    id: "csv-export",
    keywords: ["csv", "export", "report", "download", "client report"],
    facts: "You can export CSV reports from your dashboard for client deliverables and campaign tracking.",
    links: [{ label: "Features", href: "/features" }],
  },
  {
    id: "cancel",
    keywords: ["cancel", "cancellation", "unsubscribe", "stop membership", "বাতিল"],
    facts: "You can cancel your Buy Me a Coffee membership anytime. There are no long-term contracts.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  {
    id: "contact",
    keywords: [
      "contact",
      "support email",
      "talk to human",
      "talk to a human",
      "real person",
      "agent",
      "human",
      "যোগাযোগ",
      "মানুষ",
      "ইমেইল",
    ],
    facts: `Our team replies at ${COMPANY.email}. Signed-in users can also open a dashboard ticket.`,
    replies: [
      `If you'd rather talk to a real person, email us at ${COMPANY.email}. We typically reply within a few hours on business days.`,
      `Our human team is at ${COMPANY.email} for anything complex. You can also open a ticket after signing in.`,
    ],
    links: [
      { label: "Contact page", href: "/contact" },
      { label: "Email support", href: `mailto:${COMPANY.email}` },
    ],
  },
  faq("enterprise", "Do you offer enterprise or invoice billing?", [{ label: "Contact sales", href: "/contact" }]),
  {
    id: "legal",
    keywords: ["privacy", "terms", "terms of service", "security", "gdpr", "data policy", "নীতি"],
    facts: `Privacy, Terms, Security, and Refund Policy pages are on our website — I can point you to the right page.`,
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
  {
    id: "blog",
    keywords: ["blog", "article", "posts", "guides"],
    facts: `Our blog has SEO and indexing guides published on ${APP_NAME}.`,
    links: [{ label: "Blog", href: "/blog" }],
  },
];

export const CHAT_FALLBACK_FACTS = `That's outside what I have on ${APP_NAME}. Try our FAQ or email ${COMPANY.email} and a teammate will help.`;

export const CHAT_WELCOME = `Hey! I'm ${CHAT_BOT_NAME} from ${APP_NAME} support. I can help with ${CHAT_SCOPE_HINT} What would you like to know?`;
