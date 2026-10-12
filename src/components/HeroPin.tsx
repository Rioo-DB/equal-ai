"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Tall scroll runway; its height minus one viewport is the length of the transition. */
  className: string;
  /** Sticky, viewport-high stage. */
  pinClassName: string;
};

const EASE = 0.14; // how quickly the displayed progress catches up with the scroll (0..1 per frame)

/**
 * Pins its stage while the runway scrolls past and exposes the progress as
 * `--p` (0..1) on the stage, smoothed frame-to-frame so CSS driven by it never
 * jumps. Also measures the two headline lines and exposes `--l1shift`, the
 * offset that centres line 1 over line 2 (used to morph centred -> left-aligned).
 */
export default function HeroPin({ children, className, pinClassName }: Props) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    const pin = pinRef.current;
    if (!runway || !pin) return;

    let target = 0;
    let p = -1;
    let raf = 0;
    let visible = true;

    const measure = () => {
      const l1 = pin.querySelector<HTMLElement>("[data-line='1']");
      const l2 = pin.querySelector<HTMLElement>("[data-line='2']");
      if (!l1 || !l2) return;
      // Widths at their natural scale (the parent may be scaled by --p).
      const w1 = l1.offsetWidth;
      const w2 = l2.offsetWidth;
      pin.style.setProperty("--l1shift", `${((w2 - w1) / 2).toFixed(1)}px`);
    };

    const write = () => pin.style.setProperty("--p", p.toFixed(4));
    const frame = () => {
      raf = 0;
      const next = p < 0 ? target : p + (target - p) * EASE;
      p = Math.abs(target - next) < 0.0004 ? target : next;
      write();
      if (p !== target && visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      const rect = runway.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      target = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
      // Animation frames are paused while the page is hidden, so easing would
      // stall part-way and leave the stage on a stale frame. Jump straight to
      // the answer instead, and it is already right when the tab comes back.
      if (document.hidden) {
        p = target;
        write();
      } else {
        start();
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(pin);

    measure();
    onScroll();
    // Fonts can swap in after mount; re-measure once they are ready.
    document.fonts?.ready.then(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={runwayRef} className={className}>
      <div ref={pinRef} className={pinClassName}>
        {children}
      </div>
    </div>
  );
}
