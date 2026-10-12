import { demo } from "@/lib/content";
import DemoGate from "./DemoGate";
import ScrollFrames from "./ScrollFrames";
import s from "./DemoVideo.module.css";

/**
 * The product demo: the clip scrubbed by scroll, full-bleed, coming up behind
 * the departing headline. At "Click here to watch" the scroll waits (DemoGate):
 * tap the phone and the rest plays as a video with sound; or skip past it.
 */
export default function DemoVideo() {
  const { frames } = demo;
  // The sequence ends on the watch screen, so the scroll waits at its end.
  const gateAt = demo.playTo;
  return (
    <section className={s.section} aria-label="Watch how Equal handles a call">
      <ScrollFrames
        dir={frames.dir}
        count={frames.count}
        version={frames.version}
        width={frames.width}
        height={frames.height}
        ariaLabel={frames.alt}
        className={s.runway}
        pinClassName={s.pin}
        canvasClassName={s.frame}
        ambientClassName={s.ambient}
        playFrom={demo.playFrom}
        playTo={demo.playTo}
        caption={
          <DemoGate
            gateAt={gateAt}
            gate={demo.gate}
            count={frames.count}
            playFrom={demo.playFrom}
            playTo={demo.playTo}
            watch={demo.watch}
            video={demo.video}
            prompt={demo.prompt}
            frameClassName={s.frame}
          />
        }
      />
    </section>
  );
}
