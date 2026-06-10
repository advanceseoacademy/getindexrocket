import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(process.cwd(), "backups", stamp);

await mkdir(outDir, { recursive: true });

const tables = {
  users: await prisma.user.findMany(),
  sessions: await prisma.session.findMany(),
  tasks: await prisma.task.findMany({ include: { urls: true } }),
  creditTransactions: await prisma.creditTransaction.findMany(),
  paymentEvents: await prisma.paymentEvent.findMany(),
  memberships: await prisma.membership.findMany(),
};

const summary = Object.fromEntries(
  Object.entries(tables).map(([name, rows]) => [name, rows.length]),
);

await writeFile(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
await writeFile(join(outDir, "full-export.json"), JSON.stringify(tables, null, 2));

console.log(`Backup saved: ${outDir}`);
console.log(summary);

await prisma.$disconnect();
