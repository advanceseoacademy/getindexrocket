import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const timeout = setTimeout(() => {
  console.error("TIMEOUT: database connection took >15s");
  console.error("Check DATABASE_URL / Supabase network / VPS IP allowlist");
  process.exit(1);
}, 15_000);

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("OK: database connected");
  const direct = process.env.DIRECT_URL ?? "";
  if (!direct) console.warn("WARN: DIRECT_URL missing");
  else if (direct.includes(":6543")) console.warn("WARN: DIRECT_URL uses pooler 6543");
  else console.log("OK: DIRECT_URL looks valid (5432)");
} catch (err) {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  clearTimeout(timeout);
  await prisma.$disconnect();
}
