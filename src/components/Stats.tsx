import Image from "next/image";
import { stats, statsSection } from "@/lib/content";
import s from "./Stats.module.css";

export default function Stats() {
  return (
    <section className={s.section} aria-label="Equal in numbers">
      <ul className={s.row}>
        {stats.map((stat, i) => (
          <li key={stat.label} className={s.stat} data-col={i}>
            <span className={s.value}>{stat.value}</span>
            <span className={s.label}>{stat.label}</span>
          </li>
        ))}
        {[0, 1].map((i) => (
          <li key={`divider-${i}`} className={s.divider} data-col={i} aria-hidden="true">
            <Image src="/assets/divider-v.svg" alt="" width={2} height={130} className={s.dividerImg} />
          </li>
        ))}
      </ul>

      <Image
        src={statsSection.map.src}
        alt={statsSection.map.alt}
        width={statsSection.map.width}
        height={statsSection.map.height}
        sizes="(max-width: 1023px) 92vw, (max-width: 1440px) 70vw, 1001px"
        quality={90}
        className={s.map}
      />
    </section>
  );
}
