import { PrismaClient } from "@prisma/client";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DIRECT_URL or DATABASE_URL");
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

const statements = [
  'ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL',
  'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT',
  'CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId")',
];

try {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.slice(0, 60) + "...");
  }
  console.log("\nGoogle auth migration complete.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
