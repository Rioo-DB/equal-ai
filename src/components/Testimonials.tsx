import Image from "next/image";
import { testimonials } from "@/lib/content";
import s from "./Testimonials.module.css";

export default function Testimonials() {
  return (
    <section className={s.section} aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading" className={s.heading}>
        {testimonials.heading.line1}
        <br />
        <span className={s.accent}>{testimonials.heading.line2}</span>
      </h2>
      <Image
        src={testimonials.image.src}
        alt={testimonials.image.alt}
        width={testimonials.image.width}
        height={testimonials.image.height}
        sizes="(max-width: 1440px) 93vw, 1335px"
        quality={90}
        className={s.image}
      />
    </section>
  );
}
