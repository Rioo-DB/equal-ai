import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Shell from "@/components/resources/Shell";
import PostCard from "@/components/resources/PostCard";
import { ArrowIcon, PageIntro } from "@/components/resources/parts";
import { blogIntro, formatDate, posts } from "@/lib/resources";
import s from "@/components/resources/Resources.module.css";

export const metadata: Metadata = {
  title: "Blog — Equal AI",
  description: blogIntro.lede,
};

export default function BlogPage() {
  const [latest, ...rest] = posts;
  // The design sets the headline's last word in mint.
  const words = latest.title.split(" ");
  const last = words.pop();

  return (
    <Shell>
      <PageIntro title={blogIntro.title} lede={blogIntro.lede} />

      <div className={s.blogWrap}>
        <Link href={`/blog/${latest.slug}`} className={`${s.glass} ${s.feature}`}>
          {latest.image && (
            <Image
              src={latest.image}
              alt=""
              width={1800}
              height={900}
              priority
              sizes="(max-width: 1023px) 100vw, 540px"
              className={s.featureImg}
            />
          )}
          <span className={s.featureBody}>
            <span className={s.tag}>Latest</span>
            <span className={s.featureTitle}>
              {words.join(" ")} <em>{last}</em>
            </span>
            <span className={s.featureSub}>{latest.subtitle}</span>
            <time className={s.meta}>{formatDate(latest.date)}</time>
            <span className={s.readMore}>
              Read the article <ArrowIcon />
            </span>
          </span>
        </Link>

        <h2 className={s.sectionLabel}>More from the blog</h2>
        <ul className={s.postGrid}>
          {rest.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
