import Image from "next/image";
import { hero, sparks } from "@/lib/content";
import Header from "./Header";
import HeroPin from "./HeroPin";
import SparkField from "./SparkField";
import s from "./Hero.module.css";

/**
 * The opening: the arrow field and headline, pinned, held for a beat and then
 * lifted away as the product demo (DemoVideo, the next section, pulled up
 * underneath) comes up behind them.
 */
export default function Hero() {
  return (
    <section className={s.hero} aria-label="Intro">
      {/* Outside the pinned stage on purpose: inside it the nav would hold at
          the top of the screen for the section's whole runway, which reads as a
          sticky header. Here it sits at the top of the page and scrolls away. */}
      <div className={s.nav}>
        <Header />
      </div>

      <HeroPin className={s.runway} pinClassName={s.pin}>
        {/* Field of arrow particles behind the headline; lifts and fades out. */}
        <div className={s.bg} aria-hidden="true">
          <Image src={hero.background.src} alt="" fill priority sizes="100vw" quality={90} className={s.bgImg} />
        </div>

        {/* A few of the field's dots picked out and set flickering, so the
            backdrop reads as alive rather than as a still image. They brighten
            around the pointer. */}
        <SparkField sparks={sparks} className={s.sparks} sparkClassName={s.spark} />

        <div className={s.copy}>
          <p className={s.eyebrow}>{hero.eyebrow}</p>
          <h1 className={s.h1}>
            <span className={s.line}>{hero.headline.line1}</span>
            <span className={`${s.line} ${s.accent}`}>{hero.headline.line2}</span>
          </h1>
          <p className={s.sub}>{hero.sub}</p>
        </div>

      </HeroPin>
    </section>
  );
}
