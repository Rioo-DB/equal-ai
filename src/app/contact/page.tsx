import type { Metadata } from "next";
import Image from "next/image";
import Shell from "@/components/resources/Shell";
import { PageIntro } from "@/components/resources/parts";
import { contactPage } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "Contact Us — Equal AI",
  description: contactPage.intro,
};

const icons = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const socialIcons: Record<string, string> = {
  LinkedIn: "/assets/linkedin.svg",
  Instagram: "/assets/instagram.svg",
};

export default function ContactPage() {
  return (
    <Shell>
      <PageIntro title={contactPage.title} lede={contactPage.intro} />

      <div className={s.contactGrid}>
        {contactPage.cards.map((card) => (
          <a key={card.href} href={card.href} className={`${s.glass} ${s.contactCard}`}>
            <span className={s.contactIcon}>{icons[card.kind as keyof typeof icons]}</span>
            <span className={s.contactLabel}>{card.label}</span>
            <span className={s.contactValue}>{card.value}</span>
            <span className={s.contactNote}>{card.note}</span>
          </a>
        ))}
      </div>

      <ul className={s.socialRow}>
        {contactPage.social.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={s.pillLink}>
              {socialIcons[link.label] && <Image src={socialIcons[link.label]} alt="" width={18} height={18} />}
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <section className={`${s.glass} ${s.appNote}`}>
        <h2 className={s.appNoteTitle}>{contactPage.appNote.title}</h2>
        <p className={s.appNoteText}>{contactPage.appNote.body}</p>
      </section>
    </Shell>
  );
}
