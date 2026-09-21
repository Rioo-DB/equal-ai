import { statement } from "@/lib/content";
import s from "./Statement.module.css";

export default function Statement() {
  return (
    <section className={s.section} aria-label="What Equal does">
      <p className={s.text}>
        {statement.line1}
        <br />
        <span className={s.white}>{statement.line2.white}</span>
        <span className={s.accent}>{statement.line2.accent}</span>
        <br />
        {statement.line3}
      </p>
    </section>
  );
}
