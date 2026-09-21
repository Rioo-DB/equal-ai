import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { footer } from "@/lib/content";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.top}>
        <div className={s.lead}>
          <p className={s.tagline}>
            {footer.tagline.line1}
            <br />
            <span className={s.accent}>{footer.tagline.line2}</span>
          </p>
          <Link href={footer.cta.href} className={s.cta}>
            <span className={s.ctaLabel}>{footer.cta.label}</span>
            <Image src="/assets/arrow.svg" alt="" width={22} height={14} className={s.arrow} />
          </Link>
        </div>

        {footer.columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className={s.col}>
            <h2 className={s.heading}>{column.heading}</h2>
            <ul className={s.links}>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label={footer.social.heading} className={s.col}>
          <h2 className={s.heading}>{footer.social.heading}</h2>
          <ul className={s.social}>
            {footer.social.links.map((link) => (
              <li key={link.label} style={{ "--w": link.width, "--h": link.height } as CSSProperties}>
                <Link href={link.href} aria-label={link.label}>
                  <Image src={link.icon} alt="" width={link.width} height={link.height} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Image src="/assets/divider-h.svg" alt="" width={1299} height={1} className={s.divider} />

      <div className={s.wordmark}>
        <Image
          src={footer.wordmark.src}
          alt={footer.wordmark.alt}
          fill
          sizes="100vw"
          quality={90}
          className={s.wordmarkImg}
        />
      </div>
    </footer>
  );
}
