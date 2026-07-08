import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const jsonPath = resolve(process.argv[2] ?? "");
const envPath = resolve(process.argv[3] ?? ".env");

if (!jsonPath || !existsSync(jsonPath)) {
  console.error("Usage: node scripts/set-google-indexing-env.mjs <service-account.json> [.env]");
  process.exit(1);
}

const credentials = JSON.parse(readFileSync(jsonPath, "utf8"));
const jsonOneLine = JSON.stringify(credentials);
const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || "https://getindexrocket.com/";

let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

function upsert(key, value) {
  const line = `${key}=${JSON.stringify(value)}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

function upsertJson(key, jsonString) {
  const safe = jsonString.replace(/'/g, "'\\''");
  const line = `${key}='${safe}'`;
  const re = new RegExp(`^${key}=.*$`, "ms");
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

upsertJson("GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON", jsonOneLine);
upsert("GOOGLE_SEARCH_CONSOLE_SITE_URL", siteUrl);

writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
console.log(`Updated ${envPath}`);
console.log(`Service account: ${credentials.client_email}`);
console.log(`Search Console site: ${siteUrl}`);
