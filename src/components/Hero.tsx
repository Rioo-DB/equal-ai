import Image from "next/image";
import { hero } from "@/lib/content";
import Header from "./Header";
import HeroPin from "./HeroPin";
import s from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={s.hero} aria-label="Intro">
      <HeroPin className={s.runway} pinClassName={s.pin}>
        {/* Planet horizon: a dark sphere below the copy with a green rim light
            and a soft atmosphere. It sinks lower as the phone comes in. */}
        <div className={s.horizon} aria-hidden="true">
          <Image src={hero.horizon.src} alt="" fill priority sizes="100vw" quality={90} className={s.horizonImg} />
        </div>

        {/* Ambient glow that blooms around the phone once it is centred, then fades. */}
        <div className={s.ambient} aria-hidden="true">
          <Image src={hero.ambient.src} alt="" fill sizes="100vw" quality={90} className={s.ambientImg} />
        </div>

        <Header />

        {/* Centred at rest; glides to the left and shrinks as the phone comes in. */}
        <div className={s.copy}>
          <h1 className={s.h1}>
            <span className={s.line} data-line="1">
              {hero.headline.line1}
            </span>
            <span className={`${s.line} ${s.accent}`} data-line="2">
              {hero.headline.line2}
            </span>
          </h1>
          <p className={s.sub}>{hero.sub}</p>
        </div>

        {/* Fades up into the centre-right on scroll, standing on the horizon. */}
        <div className={s.phone}>
          <Image
            src={hero.phone.src}
            alt={hero.phone.alt}
            width={hero.phone.width}
            height={hero.phone.height}
            sizes="(max-width: 1023px) 70vw, 30vw"
            quality={90}
            className={s.phoneImg}
          />
        </div>
      </HeroPin>
    </section>
  );
}
