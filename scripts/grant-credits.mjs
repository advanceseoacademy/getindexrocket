import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = (process.argv[2] ?? "").toLowerCase().trim();
const amount = Number(process.argv[3]);
const makeAdmin = process.argv.includes("--admin");

if (!email || !Number.isFinite(amount) || amount <= 0) {
  console.error("Usage: node scripts/grant-credits.mjs <email> <amount> [--admin]");
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const balanceAfter = user.creditBalance + amount;

await prisma.$transaction(async (tx) => {
  await tx.user.update({
    where: { id: user.id },
    data: {
      creditBalance: balanceAfter,
      ...(makeAdmin ? { role: "admin" } : {}),
    },
  });
  await tx.creditTransaction.create({
    data: {
      userId: user.id,
      amount,
      balanceAfter,
      type: "admin_grant",
      description: "Manual credit restore",
    },
  });
});

console.log(`Granted ${amount} credits to ${email}`);
console.log(`New balance: ${balanceAfter}`);
if (makeAdmin) console.log("Role set to: admin");

await prisma.$disconnect();
