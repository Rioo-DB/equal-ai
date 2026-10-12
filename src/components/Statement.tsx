import { statement } from "@/lib/content";
import HeroPin from "./HeroPin";
import s from "./Statement.module.css";

/**
 * "Your calls, handled. …" — after the demo. Pinned: the copy zooms up out of
 * the dark, its three lines light in turn as the scroll holds, then it pushes
 * in and fades as the phones section (pulled up underneath) takes over.
 */
export default function Statement() {
  return (
    <section className={s.section} aria-label="What Equal does for you">
      <HeroPin className={s.runway} pinClassName={s.pin}>
        <p className={s.lines}>
          {statement.lines.map((line, i) => (
            <span key={i} className={s.line}>
              <span className={s.white}>{line.text}</span>
              <span className={s.accent}>{line.accent}</span>
            </span>
          ))}
        </p>
      </HeroPin>
    </section>
  );
}
