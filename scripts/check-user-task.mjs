import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];

if (!email) {
  const candidates = await prisma.user.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { email: true, creditBalance: true, _count: { select: { tasks: true } } },
  });
  console.log("Users (email | credits | tasks):");
  for (const c of candidates) {
    console.log(`  ${c.email} | ${c.creditBalance} | ${c._count.tasks}`);
  }
  await prisma.$disconnect();
  process.exit(0);
}

const user = await prisma.user.findFirst({ where: { email } });

if (!user) {
  console.log("No user found");
  process.exit(0);
}

console.log("User:", user.email, "| creditBalance:", user.creditBalance);

const tasks = await prisma.task.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
  take: 5,
  include: { _count: { select: { urls: true } }, urls: { select: { status: true } } },
});

for (const t of tasks) {
  const byStatus = {};
  for (const u of t.urls) byStatus[u.status] = (byStatus[u.status] ?? 0) + 1;
  console.log(
    `\nTask ${t.id.slice(-6)} | status=${t.status} | urls=${t._count.urls} | charged=${t.creditsCharged} | created=${t.createdAt.toISOString()}`,
  );
  console.log("  url statuses:", JSON.stringify(byStatus));
}

const txns = await prisma.creditTransaction.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
  take: 10,
  select: { amount: true, type: true, description: true, balanceAfter: true, createdAt: true },
});

console.log("\nRecent credit transactions:");
for (const tx of txns) {
  console.log(
    `  ${tx.createdAt.toISOString()} | ${tx.amount > 0 ? "+" : ""}${tx.amount} | ${tx.type} | bal=${tx.balanceAfter} | ${tx.description ?? ""}`,
  );
}

await prisma.$disconnect();
