import Image from "next/image";
import { showcase } from "@/lib/content";
import s from "./PhoneShowcase.module.css";

export default function PhoneShowcase() {
  return (
    <section id={showcase.id} className={s.section} aria-label="The Equal app">
      <Image
        src={showcase.background.src}
        alt={showcase.background.alt}
        fill
        sizes="100vw"
        quality={90}
        className={s.bg}
      />
      <Image
        src={showcase.phone.src}
        alt={showcase.phone.alt}
        width={showcase.phone.width}
        height={showcase.phone.height}
        sizes="(max-width: 1023px) 80vw, (max-width: 1440px) 40vw, 578px"
        quality={90}
        className={s.phone}
      />
    </section>
  );
}
