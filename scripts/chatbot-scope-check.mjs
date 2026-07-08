import { getChatbotReply } from "../src/lib/chatbot-engine.ts";

const cases = [
  { q: "How much per URL?", expect: "in" },
  { q: "What if crawl fails?", expect: "in" },
  { q: "Can I paste bulk URLs?", expect: "in" },
  { q: "Do credits expire?", expect: "in" },
  { q: "Is there a free trial?", expect: "in" },
  { q: "dam koto", expect: "in" },
  { q: "salam", expect: "in" },
  { q: "Talk to a human", expect: "in" },
  { q: "What is the weather today?", expect: "out" },
  { q: "Write me a Python script", expect: "out" },
  { q: "How to rank on Google?", expect: "out" },
  { q: "Is SpeedyIndex better?", expect: "out" },
  { q: "Who is the president?", expect: "out" },
  { q: "help me with homework", expect: "out" },
  { q: "best pizza near me", expect: "out" },
  { q: "tell me about bitcoin", expect: "out" },
  { q: "how to do keyword research", expect: "out" },
  { q: "compare ahrefs vs semrush", expect: "out" },
  { q: "what is love", expect: "out" },
  { q: "IndexNow signals on getindexrocket", expect: "in" },
];

let failed = 0;
for (const { q, expect } of cases) {
  const r = getChatbotReply(q);
  const actual = r.id === "out-of-scope" || r.id === "fallback" ? "out" : "in";
  const ok = actual === expect;
  if (!ok) {
    failed++;
    console.log("FAIL:", q, "=>", r.id, r.answer.slice(0, 100));
  }
}
console.log(failed === 0 ? `All ${cases.length} scope checks passed` : `${failed} failed`);
