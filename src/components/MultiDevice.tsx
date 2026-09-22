import { multiDevice } from "@/lib/content";
import ScrollFrames from "./ScrollFrames";
import s from "./MultiDevice.module.css";

export default function MultiDevice() {
  return (
    <section className={s.section} aria-label="Works across your devices">
      <ScrollFrames
        dir={multiDevice.frames.dir}
        count={multiDevice.frames.count}
        size={multiDevice.frames.size}
        ariaLabel={multiDevice.frames.alt}
        className={s.runway}
        pinClassName={s.pin}
        canvasClassName={s.canvas}
      />
    </section>
  );
}
