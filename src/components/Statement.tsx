import { statement } from "@/lib/content";
import SpotlightLines from "./SpotlightLines";
import s from "./Statement.module.css";

export default function Statement() {
  return (
    <section className={s.section} aria-label="What Equal does">
      <SpotlightLines
        lines={statement.lines}
        initial={statement.initial}
        runwayClassName={s.runway}
        pinClassName={s.pin}
        textWrapClassName={s.text}
        lineClassName={s.line}
        textClassName={s.white}
        accentClassName={s.accent}
      />
    </section>
  );
}
