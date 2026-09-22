// Turns public/assets/phones-rotate.mp4 into a WebP frame sequence that
// ScrollVideo draws on a canvas, so scrubbing never waits on video decoding.
// Run: npm run extract-frames  (re-run whenever the mp4 changes)
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const SRC = path.resolve("public/assets/phones-rotate.mp4");
const OUT = path.resolve("public/assets/phones-frames");
const FPS = 15; // frames per second of source time; 8 s -> 120 frames
const SIZE = 900; // px, square
const QUALITY = 78;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

execFileSync(
  ffmpeg,
  [
    "-hide_banner", "-loglevel", "error",
    "-i", SRC,
    "-vf", `fps=${FPS},scale=${SIZE}:${SIZE}:flags=lanczos`,
    "-c:v", "libwebp", "-quality", String(QUALITY), "-preset", "picture",
    path.join(OUT, "%03d.webp"),
  ],
  { stdio: "inherit" },
);

const frames = readdirSync(OUT).filter((f) => f.endsWith(".webp")).sort();
writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ count: frames.length, size: SIZE }));
console.log(`${frames.length} frames -> ${path.relative(process.cwd(), OUT)}`);
