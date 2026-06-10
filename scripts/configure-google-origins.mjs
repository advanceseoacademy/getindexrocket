/**
 * Opens Google Cloud Console to add IndexRocket authorized origins.
 *
 * Add ALL of these under "Authorized JavaScript origins":
 *   http://localhost:3000
 *   http://127.0.0.1:3000
 *   https://getindexrocket.com
 */

import { execSync } from "child_process";
import { platform } from "os";

const projectNumber = "879220509706";
const clientSuffix = "3r23kfpt0i5e712npg32durv1aj4qhh7.apps.googleusercontent.com";
const url = `https://console.cloud.google.com/auth/clients/${clientSuffix}?project=${projectNumber}`;

const origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://getindexrocket.com",
];

console.log("Fix Google Error 400: origin_mismatch\n");
console.log('OAuth client → "Authorized JavaScript origins" → Add each URL:\n');
for (const o of origins) {
  console.log(`  ${o}`);
}
console.log("\nSave, wait ~1 minute, then retry sign-in.\n");
console.log("Always open the app at http://localhost:3000 (not 127.0.0.1 or network IP).\n");
console.log("Console:", url, "\n");

try {
  if (platform() === "win32") {
    execSync(`start "" "${url}"`, { stdio: "inherit", shell: true });
  } else if (platform() === "darwin") {
    execSync(`open "${url}"`, { stdio: "inherit" });
  } else {
    execSync(`xdg-open "${url}"`, { stdio: "inherit" });
  }
} catch {
  console.log("Open this URL manually:", url);
}
