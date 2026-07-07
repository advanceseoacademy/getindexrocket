#!/usr/bin/env node
/**
 * Ensure INDEXNOW_KEY and CRON_SECRET exist in .env (for VPS first deploy).
 * Usage: node scripts/ensure-indexer-env.mjs [.env path]
 */
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.argv[2] ?? ".env");
if (!existsSync(envPath)) {
  console.error(`Missing ${envPath}`);
  process.exit(1);
}

let content = readFileSync(envPath, "utf8");
let changed = false;

function ensure(key, generator) {
  const re = new RegExp(`^${key}=.*$`, "m");
  const current = content.match(re)?.[0] ?? "";
  const value = current.split("=").slice(1).join("=").replace(/^["']|["']$/g, "").trim();
  if (value) return;

  const generated = generator();
  if (re.test(content)) {
    content = content.replace(re, `${key}="${generated}"`);
  } else {
    content += `\n${key}="${generated}"\n`;
  }
  changed = true;
  console.log(`Set ${key}`);
}

ensure("INDEXNOW_KEY", () => randomBytes(16).toString("hex"));
ensure("CRON_SECRET", () => randomBytes(32).toString("hex"));

if (!/^GETINDEXROCKET_PORT=/m.test(content)) {
  content += '\nGETINDEXROCKET_PORT=3005\n';
  changed = true;
  console.log("Set GETINDEXROCKET_PORT=3005");
}

if (!/^INDEXER_HUB_ORIGIN=/m.test(content) && /^NEXT_PUBLIC_APP_URL=/m.test(content)) {
  const appUrl = content.match(/^NEXT_PUBLIC_APP_URL=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, "").trim();
  if (appUrl) {
    content += `\nINDEXER_HUB_ORIGIN="${appUrl}"\n`;
    changed = true;
    console.log(`Set INDEXER_HUB_ORIGIN=${appUrl}`);
  }
}

if (changed) {
  writeFileSync(envPath, content, "utf8");
  console.log(`Updated ${envPath}`);
} else {
  console.log("Indexer env already configured");
}
