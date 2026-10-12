import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/resources/Shell";
import { BackLink, ContactStrip, QAList } from "@/components/resources/parts";
import { help, isPlatform, platforms } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return platforms.flatMap((platform) => help[platform].categories.map((c) => ({ platform, slug: c.slug })));
}

const find = (platform: string, slug: string) =>
  isPlatform(platform) ? help[platform].categories.find((c) => c.slug === slug) : undefined;

export async function generateMetadata({ params }: PageProps<"/faqs/[platform]/[slug]">): Promise<Metadata> {
  const { platform, slug } = await params;
  const category = find(platform, slug);
  if (!category || !isPlatform(platform)) return {};
  return {
    title: `${category.title} — ${help[platform].title} — Equal AI`,
    description: category.items[0]?.question,
  };
}

export default async function CategoryPage({ params }: PageProps<"/faqs/[platform]/[slug]">) {
  const { platform, slug } = await params;
  const category = find(platform, slug);
  if (!category || !isPlatform(platform)) notFound();

  return (
    <Shell>
      <div className={s.narrow}>
        <header className={s.pageHead}>
          <BackLink href={`/faqs/${platform}`} label={help[platform].title} />
          <h1 className={s.title}>{category.title}</h1>
        </header>
        <QAList items={category.items} />
        <ContactStrip />
      </div>
    </Shell>
  );
}
