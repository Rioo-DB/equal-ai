import type { Metadata } from "next";
import Shell from "@/components/resources/Shell";
import { BackLink, ContactStrip, QAList } from "@/components/resources/parts";
import { callers } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "Why did Equal contact me? — Equal AI",
  description: callers.lede,
};

export default function CallerFaqsPage() {
  return (
    <Shell>
      <div className={s.narrow}>
        <header className={s.pageHead}>
          <BackLink href="/faqs" label="FAQs" />
          <h1 className={s.title}>{callers.title}</h1>
          <p className={s.lede}>{callers.lede}</p>
        </header>
        <QAList items={callers.items} />
        <ContactStrip />
      </div>
    </Shell>
  );
}
