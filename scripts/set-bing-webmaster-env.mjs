import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const keyPath = resolve(process.argv[2] ?? "");
const envPath = resolve(process.argv[3] ?? ".env");
const siteUrl = (process.argv[4] ?? "https://getindexrocket.com").replace(/\/$/, "");

if (!keyPath || !existsSync(keyPath)) {
  console.error("Usage: node scripts/set-bing-webmaster-env.mjs <api-key.txt> [.env] [siteUrl]");
  process.exit(1);
}

const apiKey = readFileSync(keyPath, "utf8").trim();
if (!apiKey) {
  console.error("API key file is empty");
  process.exit(1);
}

let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

function upsert(key, value) {
  const line = `${key}=${JSON.stringify(value)}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
}

upsert("BING_WEBMASTER_API_KEY", apiKey);
upsert("BING_WEBMASTER_SITE_URL", siteUrl);

writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
console.log(`Updated ${envPath}`);
console.log(`BING_WEBMASTER_SITE_URL=${siteUrl}`);
