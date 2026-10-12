// Builds the product demo sequence the hero scrubs through, as WebP frames.
// Run: node scripts/extract-demo-frames.mjs  (re-run whenever the mp4 changes)
//
// Source: media/product-demo.mp4 ("Product demo_v3"), 24s 3840x2160 at 30fps:
// the "AI that handles your calls" line, an incoming call, "Click here to
// watch Equal AI in action", then Equal's chat with the caller. Kept whole (16:9): its green light streaks run edge to edge.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const SRC = path.resolve("media/product-demo.mp4");
const OUT = path.resolve("public/assets/demo-frames");
const WIDTH = 1600;
const HEIGHT = 900;
const QUALITY = 68;

// The "Click here to watch Equal AI in action" screen, fully up: the scroll
// waits here for a tap, and where the phone is in the frame (fractions of
// width/height) so the whole phone is the tap target. From here on the demo
// plays as a real video with sound: public/assets/demo-watch.mp4, cut from the
// same moment of media/product-demo-v5.mp4 (the same edit, with audio):
//   ffmpeg -ss 4.8 -i media/product-demo-v5.mp4 -vf scale=1920:1080 \
//     -c:v libx264 -crf 19 -c:a aac -b:a 128k -movflags +faststart \
//     public/assets/demo-watch.mp4
const GATE_SECONDS = 4.8;
const WATCH = { x: 0.384, y: 0.094, w: 0.232, h: 0.878 };

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

execFileSync(
  ffmpeg,
  [
    "-hide_banner", "-loglevel", "error",
    "-i", SRC,
    "-an",
    // Only up to the watch screen: everything after it is the video.
    "-t", String(GATE_SECONDS + 0.04),
    "-vf", `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
    "-c:v", "libwebp", "-quality", String(QUALITY), "-preset", "picture",
    "-start_number", "1",
    path.join(OUT, "%03d.webp"),
  ],
  { stdio: "inherit" },
);

const frames = readdirSync(OUT).filter((f) => /^\d+\.webp$/.test(f)).sort();
const fps = 30000 / 1001;
const gate = Math.round(GATE_SECONDS * fps);

const stamp = createHash("sha1");
for (const f of frames) stamp.update(readFileSync(path.join(OUT, f)));
const version = stamp.digest("hex").slice(0, 10);

writeFileSync(
  path.join(OUT, "manifest.json"),
  JSON.stringify({ count: frames.length, width: WIDTH, height: HEIGHT, gate, watch: WATCH, version }),
);
console.log(`${frames.length} frames at ${WIDTH}x${HEIGHT}, gate at frame ${gate} (v${version})`);
