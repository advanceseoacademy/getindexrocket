/**
 * Generate favicons from public/logo.png
 * Run: npm run icons:generate
 */
import sharp from "sharp";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import toIco from "to-ico";

const root = process.cwd();
const logoPath = join(root, "public/logo.png");

const meta = await sharp(logoPath).metadata();
const w = meta.width ?? 666;
const h = meta.height ?? 605;

// Rocket mark only — centered square from top of logo (excludes wordmark)
const squareSize = Math.round(Math.min(w, h * 0.62));
const crop = {
  left: Math.round((w - squareSize) / 2),
  top: Math.round(h * 0.03),
  width: squareSize,
  height: squareSize,
};

async function buildMaster() {
  return sharp(logoPath)
    .extract(crop)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 10, g: 13, b: 18, alpha: 1 },
      kernel: sharp.kernel.lanczos3,
    })
    .png();
}

const master = await buildMaster();
const masterBuffer = await master.toBuffer();

const outputs = [
  { path: join(root, "src/app/icon.png"), size: 32 },
  { path: join(root, "src/app/apple-icon.png"), size: 180 },
  { path: join(root, "public/icon.png"), size: 32 },
  { path: join(root, "public/apple-icon.png"), size: 180 },
  { path: join(root, "public/icon-192.png"), size: 192 },
  { path: join(root, "public/icon-512.png"), size: 512 },
];

for (const { path, size } of outputs) {
  await mkdir(join(path, ".."), { recursive: true });
  let pipeline = sharp(masterBuffer).resize(size, size, { kernel: sharp.kernel.lanczos3 });
  if (size <= 48) {
    pipeline = pipeline.sharpen({ sigma: size <= 32 ? 1.2 : 0.8 });
  }
  await pipeline.png().toFile(path);
  console.log(`Wrote ${path} (${size}x${size})`);
}

// favicon.ico for browsers that request /favicon.ico
const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(masterBuffer)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: size <= 16 ? 1.4 : 1.0 })
      .png()
      .toBuffer(),
  ),
);
const ico = await toIco(icoBuffers);
for (const dir of [join(root, "src/app"), join(root, "public")]) {
  const path = join(dir, "favicon.ico");
  await writeFile(path, ico);
  console.log(`Wrote ${path}`);
}

console.log("Favicon generation complete.");
