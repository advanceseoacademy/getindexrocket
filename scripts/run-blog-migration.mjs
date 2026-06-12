import "dotenv/config";
import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const direct = process.env.DIRECT_URL;
if (!direct?.trim()) {
  console.error("ERROR: DIRECT_URL missing in .env");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: direct } },
});

const MIGRATIONS = [
  "20260609120000_baseline",
  "20260610120000_add_intended_credits",
  "20260612180000_add_blog_posts",
];

function run(cmd, args, env = process.env) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true, env });
  return result.status === 0;
}

async function tableExists(name) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${name}
    ) AS exists
  `;
  return Boolean(rows[0]?.exists);
}

async function migrationApplied(name) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT 1 FROM "_prisma_migrations" WHERE migration_name = ${name} LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Checking database...");

  const blogExists = await tableExists("BlogPost");
  console.log(`BlogPost table: ${blogExists ? "exists" : "missing"}`);

  if (!blogExists) {
    console.log("\nApplying BlogPost migration SQL...");
    const sql = readFileSync(
      "prisma/migrations/20260612180000_add_blog_posts/migration.sql",
      "utf8",
    );
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(`${statement};`);
    }
    console.log("BlogPost table created.");
  }

  const env = { ...process.env, DATABASE_URL: direct, DIRECT_URL: direct };
  let hasMigrationTable = true;
  try {
    await prisma.$queryRaw`SELECT 1 FROM "_prisma_migrations" LIMIT 1`;
  } catch {
    hasMigrationTable = false;
    console.log("\nNote: _prisma_migrations table not found — skipping resolve step.");
  }

  if (hasMigrationTable) {
    for (const name of MIGRATIONS) {
      const applied = await migrationApplied(name);
      if (applied) {
        console.log(`Migration already recorded: ${name}`);
        continue;
      }
      console.log(`\nMarking migration as applied: ${name}`);
      const ok = run("npx", ["prisma", "migrate", "resolve", "--applied", name], env);
      if (!ok) {
        console.error(`Failed to resolve ${name}`);
        process.exit(1);
      }
    }
  }

  console.log("\nVerifying BlogPost table...");
  await prisma.$queryRaw`SELECT 1 FROM "BlogPost" LIMIT 1`;
  console.log("Migration complete — BlogPost table is ready.");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
