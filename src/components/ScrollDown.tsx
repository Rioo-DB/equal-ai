"use client";

import type { MouseEvent } from "react";

type Props = { label: string; target: string; className?: string };

/** The only client-side JS on the page: smooth-scrolls to the showcase section. */
export default function ScrollDown({ label, target, className }: Props) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    const el = document.querySelector(target);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <a href={target} onClick={onClick} className={className}>
      {label}
    </a>
  );
}
