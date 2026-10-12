import { testimonials } from "@/lib/content";
import HeroPin from "./HeroPin";
import VoiceMarquee from "./VoiceMarquee";
import s from "./Testimonials.module.css";

/**
 * Pinned while its runway scrolls past: the heading zooms in, then the whole
 * row of cards together — and only once that has landed does the strip start
 * running. HeroPin supplies the progress as `--p`; VoiceMarquee sets the
 * cards' reveal window.
 */
export default function Testimonials() {
  return (
    <section className={s.section} aria-labelledby="testimonials-heading">
      <HeroPin className={s.runway} pinClassName={s.pin}>
        <h2 id="testimonials-heading" className={s.heading}>
          {testimonials.heading.line1}
          <br />
          <span className={s.accent}>{testimonials.heading.line2}</span>
        </h2>
        <p className={s.sub}>{testimonials.sub}</p>
        <VoiceMarquee cards={testimonials.cards} card={testimonials.card} />
      </HeroPin>
    </section>
  );
}
