#!/usr/bin/env node
/**
 * Validate production env before deploy.
 * Usage: node scripts/production-check.mjs
 * Exit 0 = ready, 1 = blocking issues, 2 = warnings only
 */
import "dotenv/config";

const errors = [];
const warnings = [];

function req(name, test, hint) {
  if (!test) errors.push(`${name}: ${hint}`);
}

function warn(name, test, hint) {
  if (!test) warnings.push(`${name}: ${hint}`);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const indexNowKey = process.env.INDEXNOW_KEY?.trim();
const cronSecret = process.env.CRON_SECRET?.trim();
const sessionSecret = process.env.SESSION_SECRET?.trim();
const dbUrl = process.env.DATABASE_URL?.trim();
const directUrl = process.env.DIRECT_URL?.trim();

req("DATABASE_URL", Boolean(dbUrl), "required");
req("DIRECT_URL", Boolean(directUrl), "required for migrations (port 5432)");
req("NEXT_PUBLIC_APP_URL", Boolean(appUrl), "required");
req("SESSION_SECRET", Boolean(sessionSecret && sessionSecret.length >= 32), "min 32 chars");
req("CRON_SECRET", Boolean(cronSecret && cronSecret.length >= 16), "required for indexer cron");

const hasDiscovery =
  Boolean(indexNowKey && indexNowKey.length >= 8) ||
  Boolean(process.env.BING_WEBMASTER_API_KEY?.trim()) ||
  Boolean(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim());

req(
  "DISCOVERY",
  hasDiscovery,
  "set INDEXNOW_KEY and/or BING_WEBMASTER_API_KEY and/or GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON",
);

warn("INDEXNOW_KEY", Boolean(indexNowKey && indexNowKey.length >= 8), "recommended for IndexNow");
warn("BING_WEBMASTER_API_KEY", Boolean(process.env.BING_WEBMASTER_API_KEY?.trim()), "recommended for Bing");
warn(
  "GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON",
  Boolean(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim()),
  "recommended for Google",
);
warn(
  "GOOGLE_CSE",
  Boolean(process.env.GOOGLE_CSE_API_KEY?.trim() && process.env.GOOGLE_CSE_CX?.trim()),
  "optional smart verification",
);

if (directUrl?.includes(":6543")) {
  errors.push("DIRECT_URL: must use port 5432, not pooler 6543");
}

if (appUrl?.includes("localhost")) {
  warnings.push("NEXT_PUBLIC_APP_URL: still localhost");
}

console.log("=== Production check ===\n");

if (warnings.length) {
  console.log("Warnings:");
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  console.log("");
}

if (errors.length) {
  console.log("Blocking:");
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log("\nFix .env then re-run.");
  process.exit(1);
}

console.log("✓ Core production env OK");
if (warnings.length) process.exit(2);
process.exit(0);
