import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dbPath = "prisma/dev.db";

function query(sql) {
  const out = execSync(`sqlite3 ${dbPath} -json "${sql.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
  }).trim();
  return out ? JSON.parse(out) : [];
}

function toDate(ms) {
  return new Date(Number(ms));
}

async function main() {
  const users = query("SELECT * FROM User");
  const sessions = query("SELECT * FROM Session");
  const tasks = query("SELECT * FROM Task");
  const taskUrls = query("SELECT * FROM TaskUrl");
  const credits = query("SELECT * FROM CreditTransaction");

  console.log(
    `Migrating ${users.length} users, ${sessions.length} sessions, ${tasks.length} tasks...`,
  );

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        password: u.password,
        role: u.role,
        creditBalance: u.creditBalance,
        createdAt: toDate(u.createdAt),
        updatedAt: toDate(u.updatedAt),
      },
      update: {
        email: u.email,
        name: u.name,
        password: u.password,
        creditBalance: u.creditBalance,
        updatedAt: toDate(u.updatedAt),
      },
    });
  }

  for (const s of sessions) {
    await prisma.session.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        userId: s.userId,
        tokenHash: s.tokenHash,
        expiresAt: toDate(s.expiresAt),
        createdAt: toDate(s.createdAt),
      },
      update: {
        tokenHash: s.tokenHash,
        expiresAt: toDate(s.expiresAt),
      },
    });
  }

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        userId: t.userId,
        externalId: t.externalId,
        tier: t.tier,
        status: t.status,
        urlsCount: t.urlsCount,
        creditsCharged: t.creditsCharged,
        createdAt: toDate(t.createdAt),
        updatedAt: toDate(t.updatedAt),
      },
      update: {
        status: t.status,
        urlsCount: t.urlsCount,
        creditsCharged: t.creditsCharged,
        updatedAt: toDate(t.updatedAt),
      },
    });
  }

  for (const u of taskUrls) {
    await prisma.taskUrl.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        taskId: u.taskId,
        url: u.url,
        status: u.status,
        indexedAt: u.indexedAt ? toDate(u.indexedAt) : null,
        createdAt: toDate(u.createdAt),
        updatedAt: toDate(u.updatedAt),
      },
      update: {
        status: u.status,
        indexedAt: u.indexedAt ? toDate(u.indexedAt) : null,
        updatedAt: toDate(u.updatedAt),
      },
    });
  }

  for (const c of credits) {
    await prisma.creditTransaction.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        userId: c.userId,
        amount: c.amount,
        balanceAfter: c.balanceAfter,
        type: c.type,
        description: c.description,
        createdAt: toDate(c.createdAt),
      },
      update: {
        amount: c.amount,
        balanceAfter: c.balanceAfter,
        type: c.type,
        description: c.description,
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    sessions: await prisma.session.count(),
    tasks: await prisma.task.count(),
    credits: await prisma.creditTransaction.count(),
  };
  console.log("Done:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
