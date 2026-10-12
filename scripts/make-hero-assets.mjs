// Bakes the handset the opening sequence needs, so its glow costs nothing at
// scroll time. Run: node scripts/make-hero-assets.mjs
//
//  phone-glow  the handset with its silver rim light composited in. Doing this
//              with CSS drop-shadow meant re-running a six-pass filter over a
//              2312x3468 image on every frame of the zoom, which is what made
//              the sequence stutter.
// hero-arrows.png is not built here: it is exported straight from Figma
// (file fItrV1s1J88U4HGfmKeWit, node 2225:157 "sjhvjyw 1") at 2x.
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve("public/assets");
const at = (name) => path.join(dir, name);

// Widest first, so the tight bright rim lands on top of the soft falloff.
// Radii are in source pixels on a ~2300px-wide render: the handset is about
// 200px on screen at full size, so anything under ~20px here vanishes.
const GLOW = [
  { blur: 170, alpha: 0.55 },
  { blur: 80, alpha: 0.7 },
  { blur: 34, alpha: 0.85 },
  { blur: 12, alpha: 1 },
  { blur: 4, alpha: 1 },
  { blur: 1.5, alpha: 1 },
];
const PAD = 300;

// Measured off the Figma render: the silver edge is 0.97% of the handset's
// width. It is a stroke drawn inside the silhouette, not part of the halo, so
// the two are built separately and the stroke goes on top.
const RIM_RATIO = 0.0097;

async function phoneGlow() {
  const src = sharp(at("phone-single.png"));
  const { width, height } = await src.metadata();
  const W = width + PAD * 2;
  const H = height + PAD * 2;

  const padded = await src
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // The handset's silhouette, as a greyscale mask to blur into a halo.
  const silhouette = await sharp(padded).extractChannel("alpha").toBuffer();

  // How wide the handset actually is, so the rim scales with the render.
  const { data, info } = await sharp(silhouette).raw().toBuffer({ resolveWithObject: true });
  // A single-channel PNG can decode back with three, so step by the real count.
  const ch = info.channels;
  const midRow = Math.round(info.height / 2) * info.width * ch;
  let first = -1;
  let last = -1;
  for (let x = 0; x < info.width; x++) {
    if (data[midRow + x * ch] > 20) {
      if (first < 0) first = x;
      last = x;
    }
  }
  const rim = Math.max(2, Math.round((last - first) * RIM_RATIO));

  const white = () => sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } });
  const layers = [];
  for (const { blur, alpha } of GLOW) {
    const mask = await sharp(silhouette).blur(blur).linear(alpha, 0).toBuffer();
    layers.push({ input: await white().joinChannel(mask).png().toBuffer() });
  }

  // The inside stroke: the silhouette minus a copy eroded by the rim width.
  const eroded = await sharp(silhouette).blur(rim).threshold(250).toBuffer();
  const stroke = await white()
    .joinChannel(silhouette)
    .png()
    .toBuffer()
    .then((full) =>
      white()
        .joinChannel(eroded)
        .png()
        .toBuffer()
        .then((inner) => sharp(full).composite([{ input: inner, blend: "dest-out" }]).png().toBuffer())
    );

  const info2 = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([...layers, { input: padded }, { input: stroke }])
    .png({ compressionLevel: 9 })
    .toFile(at("phone-glow.png"));
  console.log(`phone-glow.png  ${info2.width}x${info2.height}  rim ${rim}px  ${Math.round(info2.size / 1024)} KB`);
}

await phoneGlow();
