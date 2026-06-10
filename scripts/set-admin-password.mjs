import "dotenv/config";
import { createHash, randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + password).digest("hex");
  return `${salt}:${hash}`;
}

const email = (process.argv[2] ?? "").toLowerCase().trim();
const password = process.argv[3] ?? "";
const makeAdmin = process.argv.includes("--admin");

if (!email || !password) {
  console.error("Usage: node scripts/set-admin-password.mjs <email> <password> [--admin]");
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const hashed = hashPassword(password);

await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashed,
    ...(makeAdmin ? { role: "admin" } : {}),
  },
});

console.log(`Password set for ${email}`);
if (makeAdmin) console.log("Role set to: admin");

await prisma.$disconnect();
