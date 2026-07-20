import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const direct = process.env.DIRECT_URL;
if (!direct?.trim()) {
  console.error("ERROR: DIRECT_URL missing in .env");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: { db: { url: direct } },
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "SignupDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SignupDevice_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SignupDevice_userId_key" ON "SignupDevice"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SignupDevice_deviceHash_key" ON "SignupDevice"("deviceHash")`,
  `CREATE INDEX IF NOT EXISTS "SignupDevice_ipHash_createdAt_idx" ON "SignupDevice"("ipHash", "createdAt")`,
];

try {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  // FK may already exist
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SignupDevice"
      ADD CONSTRAINT "SignupDevice_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/already exists/i.test(message)) throw err;
  }

  console.log("SignupDevice migration applied");
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
