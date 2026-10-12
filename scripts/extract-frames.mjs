// Builds the phone sequence ScrollFrames scrubs, as one run of WebP frames so
// scrubbing never waits on video decoding.
// Run: npm run extract-frames  (re-run whenever the mp4 changes)
//
// Source: media/phones-features.mp4 ("features 4k - slowed - 60fps"), kept
// outside public/ because only these frames are served. One 15s 3840x2160
// 60fps clip: three phones turning through five app screens (notification,
// call summary, chat, instructions, languages). Already 60fps, so every frame
// is a real one: nothing is interpolated.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const SRC = path.resolve("media/phones-features.mp4");
const OUT = path.resolve("public/assets/phones-frames");

// The phones never leave the middle of the 16:9 frame (measured across every
// frame: x 20.5%–79.5%, y 5%–95%), so the black sides are cropped off and the
// frames are 10:9.
const CROP = { w: 2400, h: 2160, x: 720, y: 0 };
// The sequence only ever plays at its resting size (~1000 CSS px wide, so
// ~2000 device px on a Retina screen), not magnified. 1600 wide is close to
// that without the decode cost of full size: big frames are what made
// scrubbing lag, as each one costs a full decode.
const WIDTH = 1500;
const HEIGHT = 1350;
// 900 frames: a touch lower than before to keep the download in check.
const QUALITY = 72;
// The source is a compressed 4K render: light spatial denoising before the
// downscale clears its blocking, and a gentle unsharp after it brings back the
// edge contrast lost in scaling. Spatial only — temporal denoising would smear
// the fast spins.
const CLEAN = "hqdn3d=2:1.5:0:0";
const SHARPEN = "unsharp=5:5:0.6:5:5:0";
// Neighbouring output frames that differ by more than this are listed in the
// manifest as cuts: ScrollFrames switches between them outright rather than
// blending, since a 50/50 mix of two far-apart frames is the same ghosting.
const CUT = 4;
// The opening zoom happens on the first frame alone (the video holds until the
// pull-back lands), magnified ~3x, so that frame gets its own close-up: just
// the lone phone (x 1452-2387 of the 4K frame, plus its glow), cut from the
// source, cleaned of compression noise, upscaled 2x and sharpened. It is laid
// over the canvas at the same spot while magnified.
const POSTER = { x: 1408, w: 1024, scale: 2, quality: 92 };
// The render's backdrop is RGB 8,8,8, not black, so against the page it shows
// as a grey box. Pull the black point up to just above it so the backdrop
// lands on true #000 and the frame edge disappears.
const BLACK = 10 / 255;

const vf = (w, h) =>
  `crop=${CROP.w}:${CROP.h}:${CROP.x}:${CROP.y},${CLEAN},scale=${w}:${h}:flags=lanczos,${SHARPEN},` +
  `colorlevels=rimin=${BLACK}:gimin=${BLACK}:bimin=${BLACK}`;

const encode = (filters, dir, extra = []) =>
  execFileSync(
    ffmpeg,
    [
      "-hide_banner", "-loglevel", "error",
      "-i", SRC,
      "-vf", filters,
      ...extra,
      "-c:v", "libwebp", "-quality", String(QUALITY), "-preset", "picture",
      "-start_number", "0",
      path.join(dir, "%04d.webp"),
    ],
    { stdio: "inherit" },
  );

const list = (dir) => readdirSync(dir).filter((f) => f.endsWith(".webp")).sort().map((f) => path.join(dir, f));

// Mean absolute difference of two frames, on small greyscale thumbnails.
const thumbs = new Map();
const thumb = async (file) => {
  if (!thumbs.has(file)) thumbs.set(file, await sharp(file).resize(200).greyscale().raw().toBuffer());
  return thumbs.get(file);
};
const diff = async (a, b) => {
  const [x, y] = [await thumb(a), await thumb(b)];
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += Math.abs(x[i] - y[i]);
  return sum / x.length;
};

const tmp = mkdtempSync(path.join(os.tmpdir(), "phones-"));
const srcDir = path.join(tmp, "src");
mkdirSync(srcDir);

console.log("extracting source frames…");
encode(vf(WIDTH, HEIGHT), srcDir);
const src = list(srcDir);

// An encode can leave a black tail frame; scrubbing onto it flashes the stage
// to black.
while (src.length && (await sharp(src[src.length - 1]).greyscale().stats()).channels[0].max === 0) src.pop();
const out = src;

const cuts = [];
for (let i = 0; i < out.length - 1; i++) if ((await diff(out[i], out[i + 1])) > CUT) cuts.push(i);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const frames = out.map((file, i) => {
  const name = `${String(i + 1).padStart(3, "0")}.webp`;
  copyFileSync(file, path.join(OUT, name));
  return name;
});

execFileSync(
  ffmpeg,
  [
    "-hide_banner", "-loglevel", "error",
    "-i", SRC,
    "-vf",
    `crop=${POSTER.w}:${CROP.h}:${POSTER.x}:0,hqdn3d=1.5:1.5:0:0,` +
      `scale=${POSTER.w * POSTER.scale}:${CROP.h * POSTER.scale}:flags=lanczos,unsharp=5:5:0.7:5:5:0,` +
      `colorlevels=rimin=${BLACK}:gimin=${BLACK}:bimin=${BLACK}`,
    "-frames:v", "1",
    "-c:v", "libwebp", "-quality", String(POSTER.quality), "-preset", "picture",
    path.join(OUT, "poster.webp"),
  ],
  { stdio: "inherit" },
);
// Where the close-up sits within the (cropped) frame, as fractions.
const poster = {
  src: "poster.webp",
  left: +((POSTER.x - CROP.x) / CROP.w).toFixed(5),
  width: +(POSTER.w / CROP.w).toFixed(5),
};
rmSync(tmp, { recursive: true, force: true });

// A fingerprint of the run, appended to every frame URL. The frames keep the
// same paths across regenerations, so without it browsers and the Next image
// cache happily serve the previous sequence and the section looks unchanged.
const stamp = createHash("sha1");
for (const f of [...frames, "poster.webp"]) stamp.update(readFileSync(path.join(OUT, f)));
const version = stamp.digest("hex").slice(0, 10);

writeFileSync(
  path.join(OUT, "manifest.json"),
  JSON.stringify({ count: frames.length, width: WIDTH, height: HEIGHT, poster, cuts, version }),
);
console.log(`${frames.length} frames at ${WIDTH}x${HEIGHT}; ${cuts.length} cuts (v${version})`);
