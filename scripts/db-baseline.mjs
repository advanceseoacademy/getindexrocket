/**
 * One-time: mark baseline migration as applied on an existing database.
 * Run before first `npm run db:migrate:deploy` if you get error P3005.
 */
import { spawnSync } from "child_process";

const result = spawnSync(
  "npx",
  ["prisma", "migrate", "resolve", "--applied", "20260609120000_baseline"],
  { stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
