import { testimonials } from "@/lib/content";
import TestimonialCarousel from "./TestimonialCarousel";
import s from "./Testimonials.module.css";

export default function Testimonials() {
  return (
    <section className={s.section} aria-labelledby="testimonials-heading">
      <h2 id="testimonials-heading" className={s.heading}>
        {testimonials.heading.line1}
        <br />
        <span className={s.accent}>{testimonials.heading.line2}</span>
      </h2>
      <TestimonialCarousel
        cards={testimonials.cards}
        initial={testimonials.initial}
        width={testimonials.card.width}
        height={testimonials.card.height}
      />
    </section>
  );
}
