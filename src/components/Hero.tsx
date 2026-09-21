import Image from "next/image";
import { hero } from "@/lib/content";
import Header from "./Header";
import ScrollDown from "./ScrollDown";
import s from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={s.hero} aria-label="Intro">
      <Image
        src={hero.background.src}
        alt={hero.background.alt}
        fill
        priority
        sizes="100vw"
        quality={90}
        className={s.bg}
      />
      <Header />
      <h1 className={s.h1}>
        {hero.headline.line1}
        <br />
        <span className={s.accent}>{hero.headline.line2}</span>
      </h1>
      <ScrollDown label={hero.scroll.label} target={hero.scroll.target} className={s.scroll} />
    </section>
  );
}
