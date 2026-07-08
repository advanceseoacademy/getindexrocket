import { APP_NAME } from "@/lib/brand";
import {
  CHAT_BOT_NAME,
  CHAT_FALLBACK_FACTS,
  CHAT_GREETINGS,
  CHAT_KNOWLEDGE,
  CHAT_OUT_OF_SCOPE_FACTS,
  type ChatKnowledge,
} from "@/lib/chatbot-knowledge";
import { COMPANY } from "@/lib/trust-content";

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "do", "does", "can", "i", "my", "me", "we",
  "you", "your", "to", "for", "of", "in", "on", "it", "and", "or", "what", "how",
  "when", "where", "why", "please", "tell", "about", "ami", "ki", "koto", "this",
  "that", "with", "from", "our", "get", "does", "will", "have", "has",
]);

/** Clearly unrelated to any product support context */
const OFF_TOPIC_PATTERNS = [
  /\b(weather|forecast|temperature|rain today)\b/i,
  /\b(recipe|cook|cooking|restaurant|food menu)\b/i,
  /\b(who is|who was|president|election|politics|war)\b/i,
  /\b(homework|assignment|write (an |a )?essay)\b/i,
  /\b(python|javascript|typescript|react native|programming tutorial|html css)\b/i,
  /\b(stock market|crypto|bitcoin|forex|betting|casino)\b/i,
  /\b(medical|doctor|medicine|symptom|disease|diagnos)\b/i,
  /\b(dating|girlfriend|boyfriend|marriage advice)\b/i,
  /\b(movie|netflix|song lyrics|cricket score|football match)\b/i,
  /\b(translate .+ (to|into) )\b/i,
  /\b(chatgpt|openai|claude ai|gemini ai)\b/i,
  /\b(near me|directions to|map of)\b/i,
];

/** General SEO / competitor talk — not our published support scope */
const GENERAL_SEO_PATTERNS = [
  /\bhow to (rank|seo|optimize|build links)\b/i,
  /\b(keyword research|on page seo|technical seo audit)\b/i,
  /\b(speedyindex|indexmenow|indexification|onehourindexing|linksindexer)\b/i,
  /\b(ahrefs|semrush|moz pro|surfer seo)\b/i,
  /\b(is .+ better than|compare .+ vs)\b/i,
];

/** User message relates to GetIndexRocket or published site topics */
const PRODUCT_SCOPE_PATTERNS = [
  /\b(getindexrocket|index\s?rocket)\b/i,
  /\b(index(ing)?|backlink|backlinks|crawl|crawled|refund|refunded|credit|credits)\b/i,
  /\b(url|urls|submit|submission|dashboard|membership|billing|payment)\b/i,
  /\b(bulk|batch|pipeline|guest post|niche edit|web 2\.0|third.?party)\b/i,
  /\b(starter|agency plan|pro plan|\$10|\$20|\$50|buy me a coffee|bmc)\b/i,
  /\b(gsc|search console|indexnow|bing webmaster|google indexing api)\b/i,
  /\b(register|sign up|sign in|login|account|my tasks)\b/i,
  /\b(pricing|price|plan|cancel|upgrade|enterprise|invoice)\b/i,
  /\b(privacy|terms|security|refund policy|faq|contact|blog)\b/i,
  /\b(csv|export|hub page|discovery signal)\b/i,
  /\b(dam|koto|keno|kivabe|ফেরত|ক্রেডিট|দাম|অ্যাকাউন্ট|যোগাযোগ)\b/i,
];

const OPENERS = [
  "Sure thing!",
  "Good question.",
  "Happy to help!",
  "Absolutely —",
  "Let me explain.",
  "Of course!",
  "Got it —",
];

const CLOSERS = [
  "Anything else about your account or URLs?",
  "Hope that clears it up!",
  "Let me know if you have another ${APP_NAME} question.",
  "Feel free to ask about pricing or refunds.",
  "I'm here for ${APP_NAME} questions.",
];

const BANGLA_OPENERS = ["অবশ্যই!", "ভালো প্রশ্ন!", "বুঝতে পারছি —", "চিন্তা করবেন না,"];

const BANGLA_CLOSERS = [
  "আর ${APP_NAME} নিয়ে প্রশ্ন থাকলে বলুন।",
  "আর কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন।",
];

const BANGLA_OUT_OF_SCOPE =
  `আমি শুধু ${APP_NAME}-এর pricing, credits, refund, URL submit ও account নিয়ে সাহায্য করতে পারি। FAQ দেখুন অথবা ${COMPANY.email}-এ মেইল করুন।`;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s?\u0980-\u09FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBanglaOrBanglish(text: string): boolean {
  return (
    /[\u0980-\u09FF]/.test(text) ||
    /\b(ki|koto|keno|kivabe|ache|hobe|lagbe|kemne|dam|bolen|bolo)\b/i.test(text)
  );
}

function isGreeting(q: string): boolean {
  if (q === "help" || q === "start") return true;
  for (const g of CHAT_GREETINGS) {
    if (q === g) return true;
    if (g.includes(" ") && q.startsWith(`${g} `)) return true;
  }
  return false;
}

function hasProductScope(query: string): boolean {
  return PRODUCT_SCOPE_PATTERNS.some((re) => re.test(query));
}

function isClearlyOutOfScope(query: string): boolean {
  const q = normalize(query);
  if (!q) return false;

  if (OFF_TOPIC_PATTERNS.some((re) => re.test(q))) return true;

  if (GENERAL_SEO_PATTERNS.some((re) => re.test(q)) && !hasProductScope(query)) return true;

  return false;
}

function scoreEntry(query: string, entry: ChatKnowledge): number {
  const q = normalize(query);
  if (!q) return 0;

  let score = 0;

  for (const keyword of entry.keywords) {
    const k = normalize(keyword);
    if (!k) continue;
    if (q === k) score += 14;
    else if (q.includes(k)) score += k.split(" ").length > 1 ? 10 : 5;
  }

  const words = q.split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  for (const word of words) {
    for (const keyword of entry.keywords) {
      const parts = normalize(keyword).split(" ");
      if (parts.includes(word)) score += 2;
    }
    if (entry.facts.toLowerCase().includes(word)) score += 0.5;
  }

  return score;
}

function humanize(facts: string, bangla: boolean, useCloser = true): string {
  if (bangla) {
    const parts = [pick(BANGLA_OPENERS), facts];
    if (useCloser) parts.push(pick(BANGLA_CLOSERS).replace("${APP_NAME}", APP_NAME));
    return parts.join(" ");
  }

  const opener = pick(OPENERS);
  const closer = useCloser
    ? pick(CLOSERS).replace(/\$\{APP_NAME\}/g, APP_NAME)
    : "";
  return `${opener} ${facts}${closer ? ` ${closer}` : ""}`;
}

function buildReply(entry: ChatKnowledge, bangla: boolean): string {
  if (entry.replies?.length) {
    const custom = pick(entry.replies);
    if (entry.id === "greeting") return custom;
    return bangla
      ? `${pick(BANGLA_OPENERS)} ${custom} ${pick(BANGLA_CLOSERS).replace("${APP_NAME}", APP_NAME)}`
      : `${pick(OPENERS)} ${custom} ${pick(CLOSERS).replace(/\$\{APP_NAME\}/g, APP_NAME)}`;
  }
  return humanize(entry.facts, bangla);
}

function outOfScopeReply(bangla: boolean): string {
  if (bangla) return BANGLA_OUT_OF_SCOPE;
  return humanize(CHAT_OUT_OF_SCOPE_FACTS, false);
}

export type ChatReply = ChatKnowledge & {
  id: string;
  answer: string;
  typingMs: number;
};

export function getChatbotReply(query: string): ChatReply {
  const q = normalize(query);
  const bangla = isBanglaOrBanglish(query);
  const typingMs = 500 + Math.min(query.length * 18, 1400);

  const outOfScopeLinks = [
    { label: "FAQ", href: "/faq" },
    { label: "Contact us", href: "/contact" },
  ];

  if (!q) {
    return {
      id: "empty",
      keywords: [],
      facts: "",
      answer: bangla
        ? `কিছু লিখে পাঠান — আমি ${APP_NAME} নিয়ে সাহায্য করার চেষ্টা করব।`
        : `Go ahead and type your ${APP_NAME} question — I'm listening.`,
      typingMs: 400,
    };
  }

  if (isClearlyOutOfScope(query)) {
    return {
      id: "out-of-scope",
      keywords: [],
      facts: CHAT_OUT_OF_SCOPE_FACTS,
      answer: outOfScopeReply(bangla),
      links: outOfScopeLinks,
      typingMs,
    };
  }

  if (isGreeting(q)) {
    const greeting = CHAT_KNOWLEDGE.find((e) => e.id === "greeting");
    if (greeting) {
      return { ...greeting, answer: buildReply(greeting, bangla), typingMs };
    }
  }

  if (/(thanks|thank you|dhonnobad|ধন্যবাদ|thnx|ty)\b/.test(q)) {
    const thanks = bangla
      ? "আপনাকে স্বাগতম! আর কিছু লাগলে জানাবেন।"
      : pick([
          `You're very welcome! — ${CHAT_BOT_NAME}`,
          "Anytime! Happy to help with ${APP_NAME} questions.",
          "Glad I could help!",
        ]).replace(/\$\{APP_NAME\}/g, APP_NAME);
    return {
      id: "thanks",
      keywords: [],
      facts: "",
      answer: thanks,
      links: [{ label: "Get started", href: "/register" }],
      typingMs: 600,
    };
  }

  if (/(bye|goodbye|see you|allah hafez|খোদা হাফেজ)/.test(q)) {
    return {
      id: "bye",
      keywords: [],
      facts: "",
      answer: bangla
        ? `ধন্যবাদ ${APP_NAME}-এ আসার জন্য! পরে আবার কথা বলবেন।`
        : `Take care! Come back anytime if you need help with ${APP_NAME}. — ${CHAT_BOT_NAME}`,
      typingMs: 500,
    };
  }

  let best: ChatKnowledge | null = null;
  let bestScore = 0;

  for (const entry of CHAT_KNOWLEDGE) {
    if (entry.id === "greeting") continue;
    const s = scoreEntry(query, entry);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  const inProductScope = hasProductScope(query);
  const minScore = inProductScope ? 4 : 7;

  if (best && bestScore >= minScore) {
    return { ...best, answer: buildReply(best, bangla), typingMs };
  }

  const fallback = bangla
    ? `এটা ${APP_NAME}-এর ওয়েবসাইটে নেই বলে মনে হচ্ছে। FAQ দেখুন অথবা ${COMPANY.email}-এ মেইল করুন।`
    : humanize(CHAT_FALLBACK_FACTS, false);

  return {
    id: "fallback",
    keywords: [],
    facts: CHAT_FALLBACK_FACTS,
    answer: fallback,
    links: outOfScopeLinks,
    typingMs,
  };
}
