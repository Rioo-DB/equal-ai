"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Fraction of scroll distance the layer moves (0 = pinned, 1 = scrolls with page). */
  speed?: number;
  /** Extra zoom applied over the course of the movement. */
  zoom?: number;
  /**
   * "top": the layer rests until its parent's top passes the top of the viewport, then drifts
   * down as the parent scrolls away (good for a first-screen hero).
   * "center": the layer drifts continuously while its parent crosses the viewport, sitting
   * at rest when the parent is centred (good for mid-page sections). Oversize the layer
   * vertically so the drift never exposes its edges.
   */
  anchor?: "top" | "center";
};

/**
 * Wraps a background layer and drives a scroll-linked parallax transform on it.
 * Updates are throttled to one per frame and stop once the parent leaves the
 * viewport. Respects prefers-reduced-motion.
 */
export default function ParallaxLayer({
  children,
  className,
  speed = 0.4,
  zoom = 0.12,
  anchor = "top",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = parent.getBoundingClientRect();
      let offset = 0;
      let progress = 0;
      if (anchor === "top") {
        // Distance the parent's top has travelled above the viewport, clamped to its height.
        const y = Math.min(Math.max(-rect.top, 0), rect.height);
        offset = y * speed;
        progress = rect.height ? y / rect.height : 0;
      } else {
        // Distance the parent has travelled since entering from the bottom of the viewport.
        const span = window.innerHeight + rect.height;
        const y = Math.min(Math.max(window.innerHeight - rect.top, 0), span);
        const mid = span / 2;
        offset = (y - mid) * speed;
        progress = mid ? Math.abs(y - mid) / mid : 0;
      }
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(${1 + progress * zoom})`;
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
  }, [speed, zoom, anchor]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
