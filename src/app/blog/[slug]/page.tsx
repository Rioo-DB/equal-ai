import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Shell from "@/components/resources/Shell";
import PostCard from "@/components/resources/PostCard";
import { BackLink } from "@/components/resources/parts";
import { formatDate, posts } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — Equal AI`,
    description: post.subtitle,
    openGraph: {
      title: post.title,
      description: post.subtitle,
      type: "article",
      ...(post.image && { images: [{ url: post.image, width: 1800, height: 900 }] }),
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const others = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <Shell>
      <article className={s.article}>
        <header className={s.articleHead}>
          <BackLink href="/blog" label="Back to blog" />
          <time className={s.articleDate}>{formatDate(post.date)}</time>
          <h1 className={s.articleTitle}>{post.title}</h1>
          <p className={s.articleSub}>{post.subtitle}</p>
        </header>
        {post.image && (
          <Image
            src={post.image}
            alt=""
            width={1800}
            height={900}
            priority
            sizes="(max-width: 1023px) 100vw, 920px"
            className={s.articleHero}
          />
        )}
        <div className={`${s.prose} ${s.articleBody}`} dangerouslySetInnerHTML={{ __html: post.body }} />
      </article>

      <section className={s.more} aria-labelledby="more-heading">
        <h2 id="more-heading" className={s.sectionLabel}>
          Keep reading
        </h2>
        <ul className={s.postGrid}>
          {others.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
