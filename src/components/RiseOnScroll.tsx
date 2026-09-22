"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** How far (px) the content starts below its resting position. */
  distance?: number;
  /**
   * Viewport fraction (0 = top, 1 = bottom) the parent's top must reach for the rise to
   * finish. The rise begins as the parent's top enters at the bottom of the viewport.
   */
  settleAt?: number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Slides its children up into place as the parent section scrolls into view.
 * Scroll-linked (scrubs both ways), one update per frame, and disabled under
 * prefers-reduced-motion.
 */
export default function RiseOnScroll({ children, className, distance = 240, settleAt = 0.35 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const top = parent.getBoundingClientRect().top;
      const start = window.innerHeight;
      const end = window.innerHeight * settleAt;
      const t = Math.min(Math.max((start - top) / (start - end), 0), 1);
      const p = easeOutCubic(t);
      el.style.transform = `translate3d(0, ${(1 - p) * distance}px, 0)`;
      el.style.opacity = String(0.15 + 0.85 * p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [distance, settleAt]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
