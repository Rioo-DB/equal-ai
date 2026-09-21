import Image from "next/image";
import { multiDevice } from "@/lib/content";
import s from "./MultiDevice.module.css";

export default function MultiDevice() {
  return (
    <section className={s.section} aria-label="Works across your devices">
      <Image
        src={multiDevice.image.src}
        alt={multiDevice.image.alt}
        width={multiDevice.image.width}
        height={multiDevice.image.height}
        sizes="(max-width: 1023px) 90vw, (max-width: 1440px) 55vw, 788px"
        quality={90}
        className={s.image}
      />
    </section>
  );
}
