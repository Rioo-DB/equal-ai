import { multiDevice } from "@/lib/content";
import FeatureCaptions from "./FeatureCaptions";
import ScrollFrames from "./ScrollFrames";
import s from "./MultiDevice.module.css";

const { frames, captions } = multiDevice;

// The screens sit between the video's spins, which the manifest marks as runs
// of cuts (the same grouping ScrollFrames plays on a clock). Not every run is
// a change of screen — a side phone turning briskly shows up as a short one —
// so the changes are the longest runs, one fewer than there are captions, in
// the order they play.
const spins: [number, number][] = [];
for (const c of [...frames.cuts].sort((x, y) => x - y)) {
  const last = spins[spins.length - 1];
  if (last && c - last[1] <= 4) last[1] = c + 1;
  else spins.push([c, c + 1]);
}
const changes = [...spins]
  .sort((x, y) => y[1] - y[0] - (x[1] - x[0]))
  .slice(0, captions.length - 1)
  .sort((x, y) => x[0] - y[0]);
// Each caption after the first takes over halfway through the spin into its
// screen; the first comes up as the phones slide aside, a few frames in.
const switchAt = changes.map(([a, b]) => Math.round((a + b) / 2));
const FIRST_AT = 4;

export default function MultiDevice() {
  return (
    <section className={s.section} aria-label="Works across your devices">
      <ScrollFrames
        dir={frames.dir}
        count={frames.count}
        version={frames.version}
        width={frames.width}
        height={frames.height}
        cuts={frames.cuts}
        ariaLabel={frames.alt}
        className={s.runway}
        pinClassName={s.pin}
        canvasClassName={s.canvas}
        playFrom={multiDevice.playFrom}
        playTo={multiDevice.playTo}
        caption={<FeatureCaptions captions={captions} switchAt={switchAt} firstAt={FIRST_AT} />}
      />
    </section>
  );
}
