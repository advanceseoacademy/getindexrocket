/**
 * Backfill hubToken for TaskUrls created before the self-hosted indexer.
 * Run once: node scripts/backfill-hub-tokens.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

const rows = await prisma.taskUrl.findMany({
  where: { hubToken: null },
  select: { id: true, taskId: true },
});

let updated = 0;
for (const row of rows) {
  await prisma.taskUrl.update({
    where: { id: row.id },
    data: {
      hubToken: nanoid(16),
      nextRunAt: new Date(),
      status: "pending",
    },
  });
  updated += 1;
}

console.log(`Backfilled hubToken for ${updated} URL(s).`);

await prisma.$disconnect();
