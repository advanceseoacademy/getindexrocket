import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const backupPath = process.argv[2];
if (!backupPath) {
  console.error("Usage: node scripts/db-restore.mjs <path-to-full-export.json>");
  process.exit(1);
}

const file = backupPath.endsWith(".json")
  ? backupPath
  : join(backupPath, "full-export.json");

const data = JSON.parse(await readFile(file, "utf8"));
const prisma = new PrismaClient();

console.log("Restoring backup — this upserts by primary key (does not delete extra rows).");

for (const user of data.users ?? []) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: user,
    update: {
      email: user.email,
      name: user.name,
      password: user.password,
      googleId: user.googleId,
      role: user.role,
      creditBalance: user.creditBalance,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    },
  });
}

for (const session of data.sessions ?? []) {
  await prisma.session.upsert({
    where: { id: session.id },
    create: {
      ...session,
      expiresAt: new Date(session.expiresAt),
      createdAt: new Date(session.createdAt),
    },
    update: {
      userId: session.userId,
      tokenHash: session.tokenHash,
      expiresAt: new Date(session.expiresAt),
    },
  });
}

for (const task of data.tasks ?? []) {
  const { urls, ...taskData } = task;
  await prisma.task.upsert({
    where: { id: task.id },
    create: {
      ...taskData,
      createdAt: new Date(taskData.createdAt),
      updatedAt: new Date(taskData.updatedAt),
      urls: {
        create: (urls ?? []).map((u) => ({
          id: u.id,
          url: u.url,
          status: u.status,
          indexedAt: u.indexedAt ? new Date(u.indexedAt) : null,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        })),
      },
    },
    update: {
      userId: taskData.userId,
      externalId: taskData.externalId,
      providerTaskId: taskData.providerTaskId,
      tier: taskData.tier,
      status: taskData.status,
      urlsCount: taskData.urlsCount,
      creditsCharged: taskData.creditsCharged,
      updatedAt: new Date(taskData.updatedAt),
    },
  });

  for (const url of urls ?? []) {
    await prisma.taskUrl.upsert({
      where: { id: url.id },
      create: {
        ...url,
        indexedAt: url.indexedAt ? new Date(url.indexedAt) : null,
        createdAt: new Date(url.createdAt),
        updatedAt: new Date(url.updatedAt),
      },
      update: {
        url: url.url,
        status: url.status,
        indexedAt: url.indexedAt ? new Date(url.indexedAt) : null,
        updatedAt: new Date(url.updatedAt),
      },
    });
  }
}

for (const tx of data.creditTransactions ?? []) {
  await prisma.creditTransaction.upsert({
    where: { id: tx.id },
    create: {
      ...tx,
      createdAt: new Date(tx.createdAt),
    },
    update: {
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      type: tx.type,
      description: tx.description,
    },
  });
}

for (const event of data.paymentEvents ?? []) {
  await prisma.paymentEvent.upsert({
    where: { id: event.id },
    create: {
      ...event,
      intendedCredits: event.intendedCredits ?? 0,
      createdAt: new Date(event.createdAt),
    },
    update: {
      userId: event.userId,
      creditsAdded: event.creditsAdded,
      intendedCredits: event.intendedCredits ?? 0,
      amountUsd: event.amountUsd,
      planId: event.planId,
      eventType: event.eventType,
    },
  });
}

for (const membership of data.memberships ?? []) {
  await prisma.membership.upsert({
    where: { id: membership.id },
    create: {
      ...membership,
      canceledAt: membership.canceledAt ? new Date(membership.canceledAt) : null,
      currentPeriodStart: membership.currentPeriodStart
        ? new Date(membership.currentPeriodStart)
        : null,
      currentPeriodEnd: membership.currentPeriodEnd
        ? new Date(membership.currentPeriodEnd)
        : null,
      createdAt: new Date(membership.createdAt),
      updatedAt: new Date(membership.updatedAt),
    },
    update: {
      userId: membership.userId,
      status: membership.status,
      paused: membership.paused,
      cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
      updatedAt: new Date(membership.updatedAt),
    },
  });
}

console.log("Restore complete.");
await prisma.$disconnect();
