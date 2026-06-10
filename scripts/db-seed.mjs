import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

if (adminEmails.length === 0) {
  console.log("No ADMIN_EMAILS in .env — nothing to seed.");
  process.exit(0);
}

for (const email of adminEmails) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`Not registered yet (skip): ${email}`);
    continue;
  }
  if (user.role === "admin") {
    console.log(`Already admin: ${email}`);
    continue;
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  console.log(`Promoted to admin: ${email}`);
}

await prisma.$disconnect();
