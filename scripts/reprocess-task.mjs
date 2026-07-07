import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const taskShortId = process.argv[2]; // last 6 chars, e.g. 1ylynk
const shouldCharge = process.argv[3] === "charge";

if (!taskShortId) {
  console.log("Usage: node scripts/reprocess-task.mjs <task-id-suffix> [charge]");
  process.exit(1);
}

const task = await prisma.task.findFirst({
  where: { id: { endsWith: taskShortId } },
  include: { user: true, _count: { select: { urls: true } } },
});

if (!task) {
  console.log("Task not found");
  process.exit(1);
}

console.log(
  `Task ${task.id.slice(-6)} | user=${task.user.email} | urls=${task._count.urls} | charged=${task.creditsCharged} | balance=${task.user.creditBalance}`,
);

if (shouldCharge) {
  const marker = `recharge:${task.id}`;
  const already = await prisma.creditTransaction.findFirst({
    where: { userId: task.userId, description: { contains: marker } },
  });
  if (already) {
    console.log("Already re-charged, skipping deduction.");
  } else {
    const cost = task.creditsCharged;
    const balanceAfter = task.user.creditBalance - cost;
    if (balanceAfter < 0) {
      console.log(`Insufficient balance to re-charge ${cost}.`);
      process.exit(1);
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: task.userId },
        data: { creditBalance: balanceAfter },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: task.userId,
          amount: -cost,
          balanceAfter,
          type: "submit",
          description: `Re-charge after failed submit reconciliation (${marker})`,
        },
      }),
    ]);
    console.log(`Re-charged ${cost}. New balance: ${balanceAfter}`);
  }
}

// Reset URLs so the pipeline re-attempts discovery cleanly.
const now = new Date();
await prisma.taskUrl.updateMany({
  where: { taskId: task.id, status: { notIn: ["crawled", "refunded"] } },
  data: { status: "pending", indexNowAt: null, nextRunAt: now, lastError: null, attempts: 0 },
});
await prisma.task.update({ where: { id: task.id }, data: { status: "submitted" } });

console.log("Task reset to queue. Run: node scripts/run-indexer-once.mjs");

await prisma.$disconnect();
