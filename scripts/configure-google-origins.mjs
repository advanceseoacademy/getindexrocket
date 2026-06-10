/**
 * Opens Google Cloud Console to add IndexRocket authorized origins
 * to your existing OAuth Web client (Firebase / todolist project).
 *
 * Add these under "Authorized JavaScript origins":
 *   http://localhost:3000
 *   https://getindexrocket.com
 */

import { execSync } from "child_process";

const projectNumber = "91360016355";
const clientSuffix = "u2nq5ufd015tumtnqu0safofr2i0hkcp.apps.googleusercontent.com";
const url = `https://console.cloud.google.com/auth/clients/${clientSuffix}?project=${projectNumber}`;

console.log("Add these Authorized JavaScript origins in Google Cloud Console:\n");
console.log("  http://localhost:3000");
console.log("  https://getindexrocket.com\n");
console.log("Opening:", url, "\n");

try {
  execSync(`open "${url}"`, { stdio: "inherit" });
} catch {
  console.log("Open this URL manually:", url);
}
