import "dotenv/config";

const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim();
console.log("present:", Boolean(raw));
console.log("length:", raw?.length ?? 0);
try {
  const parsed = raw ? JSON.parse(raw) : null;
  console.log("type:", parsed?.type);
  console.log("email:", parsed?.client_email);
} catch (e) {
  console.log("parse error:", e instanceof Error ? e.message : e);
}
