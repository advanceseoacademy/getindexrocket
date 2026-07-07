import "dotenv/config";
import { spawnSync } from "child_process";

const TIMEOUT_MS = 90_000;

const direct = process.env.DIRECT_URL ?? "";
const database = process.env.DATABASE_URL ?? "";

if (!direct.trim()) {
  console.error("ERROR: DIRECT_URL is missing in .env");
  console.error("Supabase → Connect → Session mode → port 5432 → copy URI as DIRECT_URL");
  process.exit(1);
}

if (direct.includes(":6543") || direct.includes("pgbouncer=true")) {
  console.error("ERROR: DIRECT_URL must use port 5432, not pooler 6543");
  process.exit(1);
}

if (!database.trim()) {
  console.error("ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
}

console.log("DIRECT_URL host check:", direct.replace(/:[^:@]+@/, ":***@"));

function run(label, cmd, args, env = process.env) {
  console.log(`\n--- ${label} ---`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    timeout: TIMEOUT_MS,
    env,
  });

  if (result.error?.code === "ETIMEDOUT") {
    console.error(`\nTIMEOUT: ${label} took longer than ${TIMEOUT_MS / 1000}s`);
    return false;
  }

  return result.status === 0;
}

const ok = run("prisma migrate deploy", "npx", ["prisma", "migrate", "deploy"], {
  ...process.env,
  DATABASE_URL: direct,
  PGCONNECT_TIMEOUT: "15",
});

if (!ok) {
  console.error(`
Migration failed or timed out (common on Supabase pooler / wrong DIRECT_URL).

OPTION A — Supabase Dashboard → SQL Editor, run once:
  ALTER TABLE "PaymentEvent" ADD COLUMN IF NOT EXISTS "intendedCredits" INTEGER NOT NULL DEFAULT 0;

Then on VPS:
  npx prisma migrate resolve --applied 20260609120000_add_intended_credits

OPTION B — Fix .env DIRECT_URL (Session mode, port 5432, same project as DATABASE_URL)

OPTION C — Skip migration and continue deploy:
  SKIP_DB_MIGRATE=1 bash scripts/vps-deploy.sh
`);
  process.exit(1);
}

console.log("\nMigrations OK.");
process.exit(0);
