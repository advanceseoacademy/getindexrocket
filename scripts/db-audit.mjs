import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const tables = await p.$queryRaw`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("DB tables:", tables.map((t) => t.table_name).join(", "));

const counts = {
  users: await p.user.count(),
  sessions: await p.session.count(),
  tasks: await p.task.count(),
  taskUrls: await p.taskUrl.count(),
  creditTransactions: await p.creditTransaction.count(),
  paymentEvents: await p.paymentEvent.count(),
  memberships: await p.membership.count(),
};
console.log("Row counts:", counts);

const migrations = await p.$queryRaw`
  SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at
`.catch(() => []);
console.log("Migrations:", migrations);

const user = await p.user.findUnique({
  where: { email: "mdlitonislam69@gmail.com" },
  select: { email: true, creditBalance: true, role: true, googleId: true },
});
console.log("Owner account:", user);

await p.$disconnect();
