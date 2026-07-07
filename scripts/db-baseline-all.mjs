/**
 * Mark all existing migrations as applied (one-time baseline for Supabase DB
 * that was created before Prisma migrate history existed).
 */
import "dotenv/config";
import { spawnSync } from "child_process";

const migrations = [
  "20260609120000_baseline",
  "20260610120000_add_intended_credits",
  "20260612180000_add_blog_posts",
  "20260707183000_self_hosted_indexer",
  "20260707190000_task_smart_verification",
  "20260707191500_support_tickets",
];

const direct = process.env.DIRECT_URL ?? "";
if (!direct.trim()) {
  console.error("ERROR: DIRECT_URL missing");
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: direct, PGCONNECT_TIMEOUT: "15" };

for (const name of migrations) {
  console.log(`\n--- resolve --applied ${name} ---`);
  const result = spawnSync(
    "npx",
    ["prisma", "migrate", "resolve", "--applied", name],
    { stdio: "inherit", shell: true, env },
  );
  if (result.status !== 0) {
    console.warn(`WARN: could not resolve ${name} (may already be applied)`);
  }
}

console.log("\nBaseline complete.");
