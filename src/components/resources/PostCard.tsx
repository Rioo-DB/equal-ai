import Image from "next/image";
import Link from "next/link";
import { formatDate, type Post } from "@/lib/resources";
import { ArrowCircle } from "./parts";
import s from "./Resources.module.css";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`${s.glass} ${s.postCard}`}>
      {post.image && (
        <Image
          src={post.image}
          alt=""
          width={1800}
          height={900}
          sizes="(max-width: 680px) 100vw, 520px"
          className={s.postImg}
        />
      )}
      <span className={s.postFoot}>
        <span>
          <span className={s.postTitle}>{post.title}</span>
          <span className={s.postSub}>{post.subtitle}</span>
          <time className={s.meta}>{formatDate(post.date)}</time>
        </span>
        <ArrowCircle />
      </span>
    </Link>
  );
}
