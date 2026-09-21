// Pre-compresses public/assets/*.png to WebP for pure static hosting
// (output: 'export' + images.unoptimized), where Next.js does not optimize
// images at request time. Run: npm run optimize-images
// Then set IMAGE_FORMAT to "webp" in src/lib/content.ts.
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve("public/assets");
const MAX_WIDTH = 2880; // 2x the 1440px design width
const QUALITY = 90; // keeps the green glow gradients from banding

for (const file of await readdir(dir)) {
  if (!file.endsWith(".png")) continue;
  const src = path.join(dir, file);
  const out = src.replace(/\.png$/, ".webp");
  const image = sharp(src);
  const { width } = await image.metadata();
  const info = await image
    .resize({ width: Math.min(width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  console.log(`${file} -> ${path.basename(out)} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
