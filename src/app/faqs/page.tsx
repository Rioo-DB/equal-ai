import type { Metadata } from "next";
import Shell from "@/components/resources/Shell";
import { BackLink, HubGrid, PageIntro } from "@/components/resources/parts";
import { faqs } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "FAQs — Equal AI",
  description: faqs.lede,
};

export default function FaqsPage() {
  return (
    <Shell>
      <div className={s.backRow}>
        <BackLink href="/resources" label="Resources" />
      </div>
      <PageIntro title={faqs.title} lede={faqs.lede} />
      <HubGrid cards={faqs.cards} />
    </Shell>
  );
}
