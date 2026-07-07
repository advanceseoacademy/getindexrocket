import "dotenv/config";
import { spawnSync } from "child_process";

const direct = process.env.DIRECT_URL ?? "";

console.log("Step 1/3 — backup database...");
const backup = spawnSync("node", ["scripts/db-backup.mjs"], { stdio: "inherit", shell: true });
if (backup.status !== 0) process.exit(backup.status ?? 1);

console.log("\nStep 2/3 — apply schema with prisma db push (via DIRECT_URL)...");
if (!direct.trim()) {
  console.error("ERROR: DIRECT_URL missing — required for schema push");
  process.exit(1);
}

const push = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  shell: true,
  timeout: 120_000,
  env: { ...process.env, DATABASE_URL: direct, PGCONNECT_TIMEOUT: "15" },
});
if (push.status !== 0) process.exit(push.status ?? 1);

console.log("\nStep 3/3 — regenerate Prisma client...");
const gen = spawnSync("npx", ["prisma", "generate"], { stdio: "inherit", shell: true });
process.exit(gen.status ?? 0);
