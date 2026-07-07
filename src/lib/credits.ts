import { refreshUserCache } from "./auth";
import { prisma } from "./prisma";
import { CREDIT_PER_URL } from "./brand";
import { calculateSubmitCost, type SubmitOptions } from "./submit-cost";

export function getCreditCost(urlCount: number, options: SubmitOptions = {}) {
  return calculateSubmitCost(urlCount, options).total;
}

export async function deductCredits(
  userId: string,
  amount: number,
  type: string,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.creditBalance < amount) {
      throw new Error("Insufficient credits");
    }
    const balanceAfter = user.creditBalance - amount;
    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: balanceAfter },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        balanceAfter,
        type,
        description,
      },
    });
    return { balanceAfter, userId };
  }).then(async ({ balanceAfter, userId }) => {
    await refreshUserCache(userId);
    return balanceAfter;
  });
}

export async function addCredits(
  userId: string,
  amount: number,
  type: string,
  description?: string,
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const balanceAfter = user.creditBalance + amount;
    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: balanceAfter },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        balanceAfter,
        type,
        description,
      },
    });
    return { balanceAfter, userId };
  }).then(async ({ balanceAfter, userId }) => {
    await refreshUserCache(userId);
    return balanceAfter;
  });
}

export async function refundCredits(
  userId: string,
  amount: number,
  description?: string,
) {
  return addCredits(userId, amount, "refund", description);
}

/** Idempotent per-taskUrl refund when crawl verification fails. */
export async function refundUrlIfEligible(
  userId: string,
  taskUrlId: string,
  url: string,
  amount = CREDIT_PER_URL,
) {
  const marker = `taskUrl:${taskUrlId}`;
  const existing = await prisma.creditTransaction.findFirst({
    where: { userId, type: "refund", description: { contains: marker } },
    select: { id: true },
  });
  if (existing) return false;

  await refundCredits(
    userId,
    amount,
    `Crawl failed — credit returned (${marker}) ${url}`,
  );
  return true;
}
