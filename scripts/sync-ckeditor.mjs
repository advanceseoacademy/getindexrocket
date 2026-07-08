import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules", "ckeditor4");
const target = path.join(root, "public", "ckeditor");
const customContentsCss = path.join(root, "scripts", "ckeditor", "blog-admin-contents.css");
const customChromeCss = path.join(root, "scripts", "ckeditor", "blog-admin-chrome.css");
const maxFreeCkeditorVersion = "4.22.1";

if (!existsSync(source)) {
  console.warn("sync-ckeditor: ckeditor4 package not installed, skipping");
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(path.join(source, "package.json"), "utf8"));
if (pkg.version !== maxFreeCkeditorVersion) {
  console.warn(
    `sync-ckeditor: expected ckeditor4@${maxFreeCkeditorVersion} (last free release). Found ${pkg.version}; 4.23+ requires a paid license.`,
  );
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}

mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

if (existsSync(customContentsCss)) {
  cpSync(customContentsCss, path.join(target, "blog-admin-contents.css"));
}

if (existsSync(customChromeCss)) {
  cpSync(customChromeCss, path.join(target, "blog-admin-chrome.css"));
}

console.log("sync-ckeditor: copied CKEditor 4 to public/ckeditor");
