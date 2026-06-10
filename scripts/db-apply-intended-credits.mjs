import "dotenv/config";
import { PrismaClient } from "@prisma/client";

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL missing");
  process.exit(1);
}

// DDL must use direct/session connection (port 5432)
process.env.DATABASE_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();

try {
  console.log("Adding PaymentEvent.intendedCredits if missing...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "PaymentEvent"
    ADD COLUMN IF NOT EXISTS "intendedCredits" INTEGER NOT NULL DEFAULT 0;
  `);

  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'PaymentEvent' AND column_name = 'intendedCredits'
  `;
  console.log("Column check:", cols);

  const migrations = await prisma.$queryRaw`
    SELECT migration_name FROM _prisma_migrations
    WHERE migration_name = '20260610120000_add_intended_credits'
  `.catch(() => []);

  if (!Array.isArray(migrations) || migrations.length === 0) {
    console.log("Recording migration in _prisma_migrations...");
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (
        gen_random_uuid()::text,
        'manual',
        NOW(),
        '20260610120000_add_intended_credits',
        NULL,
        NULL,
        NOW(),
        1
      )
      ON CONFLICT DO NOTHING;
    `).catch((err) => {
      console.log("Migration record skip:", err instanceof Error ? err.message : err);
    });
  } else {
    console.log("Migration already recorded.");
  }

  console.log("Done — intendedCredits column is ready.");
} catch (err) {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
