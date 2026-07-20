import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/** Queue stuck submitted URLs for rediscovery on next cron run. */
const p = new PrismaClient();

const result = await p.taskUrl.updateMany({
  where: {
    hubToken: { not: null },
    botHitAt: null,
    status: { in: ["pending", "submitted", "discovered", "processing"] },
  },
  data: {
    nextRunAt: new Date(),
  },
});

console.log(`Queued ${result.count} URL(s) for rediscovery`);
await p.$disconnect();
