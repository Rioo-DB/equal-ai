import Image from "next/image";
import Link from "next/link";
import type { HubCard, QA } from "@/lib/resources";
import { contactPage } from "@/lib/resources";
import s from "./Resources.module.css";

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The ringed arrow in the corner of every card. */
export function ArrowCircle() {
  return (
    <span className={s.arrowCircle} aria-hidden="true">
      <ArrowIcon className={s.arrowIcon} />
    </span>
  );
}

/** Mint page title with an optional lede, centred. */
export function PageIntro({ title, lede, eyebrow }: { title: string; lede?: string; eyebrow?: string }) {
  return (
    <div className={s.intro}>
      {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
      <h1 className={s.title}>{title}</h1>
      {lede && <p className={s.lede}>{lede}</p>}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={s.back}>
      <ArrowIcon className={s.backIcon} />
      {label}
    </Link>
  );
}

/** Glass cards with a 3D icon, as on the Resources and FAQ hubs. Rows of three, the last row centred. */
export function HubGrid({ cards }: { cards: HubCard[] }) {
  return (
    <ul className={s.hubGrid}>
      {cards.map((card) => (
        <li key={card.href}>
          <Link href={card.href} className={`${s.glass} ${s.hubCard}`}>
            {card.image && (
              <Image src={card.image} alt={card.imageAlt} width={160} height={160} sizes="96px" className={s.hubIcon} />
            )}
            <span className={s.hubText}>
              <span className={s.hubTitle}>{card.title}</span>
              {card.description && <span className={s.hubDesc}>{card.description}</span>}
            </span>
            <ArrowCircle />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Question list. Uses <details> so it opens without JavaScript and every answer stays in the HTML. */
export function QAList({ items }: { items: QA[] }) {
  return (
    <div className={s.qaList}>
      {items.map((item, i) => (
        <details key={item.id} id={item.id} className={`${s.glass} ${s.qa}`}>
          <summary className={s.qaQuestion}>
            <span className={s.qaNum}>{String(i + 1).padStart(2, "0")}</span>
            <span className={s.qaText}>{item.question}</span>
            <span className={s.qaToggle} aria-hidden="true" />
          </summary>
          <div className={`${s.prose} ${s.qaAnswer}`} dangerouslySetInnerHTML={{ __html: item.answer }} />
        </details>
      ))}
    </div>
  );
}

/** Phone and email, shown under every FAQ page. */
export function ContactStrip() {
  return (
    <aside className={`${s.glass} ${s.contactStrip}`} aria-label="Contact">
      <div>
        <p className={s.contactStripTitle}>Still need help?</p>
        <p className={s.contactStripText}>Talk to a human — we read everything that comes in.</p>
      </div>
      <div className={s.contactStripLinks}>
        {contactPage.cards.map((c) => (
          <a key={c.href} href={c.href} className={s.pillLink}>
            {c.value}
          </a>
        ))}
      </div>
    </aside>
  );
}
