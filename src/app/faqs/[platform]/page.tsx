import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/resources/Shell";
import { BackLink, ContactStrip, HubGrid, PageIntro } from "@/components/resources/parts";
import { categoryCard, help, isPlatform, platforms } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return platforms.map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: PageProps<"/faqs/[platform]">): Promise<Metadata> {
  const { platform } = await params;
  if (!isPlatform(platform)) return {};
  return { title: `${help[platform].title} — Equal AI`, description: help[platform].lede };
}

export default async function PlatformPage({ params }: PageProps<"/faqs/[platform]">) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();
  const page = help[platform];

  return (
    <Shell>
      <div className={s.backRow}>
        <BackLink href="/faqs" label="FAQs" />
      </div>
      <PageIntro title={page.title} lede={page.lede} />
      <HubGrid cards={page.categories.map((c) => categoryCard(platform, c))} />
      <div className={s.narrow}>
        <ContactStrip />
      </div>
    </Shell>
  );
}
