import "dotenv/config";
import { spawnSync } from "child_process";

const direct = process.env.DIRECT_URL ?? "";
const database = process.env.DATABASE_URL ?? "";

if (!direct.trim()) {
  console.error("ERROR: DIRECT_URL is missing in .env");
  console.error("Add DIRECT_URL with Supabase port 5432 (session/direct), not 6543.");
  process.exit(1);
}

if (direct.includes(":6543") || direct.includes("pgbouncer=true")) {
  console.error("ERROR: DIRECT_URL must NOT use pooler port 6543 or pgbouncer=true");
  console.error("Use port 5432 for migrations. Example:");
  console.error(
    "  DIRECT_URL=postgresql://postgres.xxx:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres",
  );
  process.exit(1);
}

if (!database.trim()) {
  console.error("ERROR: DATABASE_URL is missing in .env");
  process.exit(1);
}

console.log("Applying schema patch (intendedCredits)...");
const patch = spawnSync(
  "npx",
  [
    "prisma",
    "db",
    "execute",
    "--file",
    "prisma/migrations/20260610120000_add_intended_credits/migration.sql",
    "--schema",
    "prisma/schema.prisma",
  ],
  { stdio: "inherit", shell: true },
);

if (patch.status !== 0) {
  console.error("Schema patch failed. Check DIRECT_URL (port 5432).");
  process.exit(patch.status ?? 1);
}

console.log("Running prisma migrate deploy...");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
});

process.exit(migrate.status ?? 1);
