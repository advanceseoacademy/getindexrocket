import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const clientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";

console.log("Google auth setup status\n");

if (!clientId) {
  console.log("❌ GOOGLE_CLIENT_ID not set in .env");
  console.log("\nCreate OAuth client:");
  console.log("  1. https://console.cloud.google.com/apis/credentials");
  console.log("  2. Create credentials → OAuth client ID → Web application");
  console.log("  3. Authorized JavaScript origins:");
  console.log("       http://localhost:3000");
  console.log("       https://getindexrocket.com");
  console.log("  4. Paste Client ID into .env:");
  console.log('       NEXT_PUBLIC_GOOGLE_CLIENT_ID="....apps.googleusercontent.com"');
  console.log('       GOOGLE_CLIENT_ID="....apps.googleusercontent.com"');
  process.exit(1);
}

if (!clientId.includes(".apps.googleusercontent.com")) {
  console.log("⚠️  Client ID format looks unusual:", clientId);
} else {
  console.log("✅ Google Client ID configured");
}

console.log("✅ Run: npm run db:google-auth (if not applied yet)");
