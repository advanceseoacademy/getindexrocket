import { spawnSync } from "child_process";

console.log("Step 1/3 — backup database...");
const backup = spawnSync("node", ["scripts/db-backup.mjs"], { stdio: "inherit", shell: true });
if (backup.status !== 0) process.exit(backup.status ?? 1);

console.log("\nStep 2/3 — apply schema with prisma db push...");
const push = spawnSync("npx", ["prisma", "db", "push"], { stdio: "inherit", shell: true });
if (push.status !== 0) process.exit(push.status ?? 1);

console.log("\nStep 3/3 — regenerate Prisma client...");
const gen = spawnSync("npx", ["prisma", "generate"], { stdio: "inherit", shell: true });
process.exit(gen.status ?? 0);
