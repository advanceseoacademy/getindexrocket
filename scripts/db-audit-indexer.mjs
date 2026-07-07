import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [total, noHub, active, oldTasks] = await Promise.all([
  prisma.taskUrl.count(),
  prisma.taskUrl.count({ where: { hubToken: null } }),
  prisma.taskUrl.count({
    where: {
      hubToken: { not: null },
      status: { in: ["pending", "submitted", "discovered", "processing"] },
    },
  }),
  prisma.task.count({ where: { externalId: { not: null }, urls: { some: { hubToken: null } } } }),
]);

console.log(JSON.stringify({ totalUrls: total, noHubToken: noHub, activeIndexerUrls: active, legacyTasks: oldTasks }, null, 2));

await prisma.$disconnect();
