"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export type SpotlightLine = { text: string; accent: string };

type Props = {
  lines: SpotlightLine[];
  /** Index of the line lit before JS runs (and under prefers-reduced-motion). */
  initial?: number;
  runwayClassName: string;
  pinClassName: string;
  textWrapClassName: string;
  lineClassName: string;
  textClassName: string;
  accentClassName: string;
};

const EASE = 0.16; // how quickly the displayed progress catches up with the scroll

/**
 * Pins the block while its runway scrolls past and lights each line in turn:
 * muted grey -> white, with the line's last word turning green. Each line
 * exposes its 0..1 intensity as `--lit` and the CSS mixes the colours. The
 * highlight travels line 1 -> 2 -> 3 across the runway, so the section holds
 * until every line has been read, then releases and the page scrolls on.
 */
export default function SpotlightLines({
  lines,
  initial = 1,
  runwayClassName,
  pinClassName,
  textWrapClassName,
  lineClassName,
  textClassName,
  accentClassName,
}: Props) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    const wrap = wrapRef.current;
    if (!runway || !wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(wrap.children) as HTMLElement[];
    const n = els.length;
    if (!n) return;

    let target = 0;
    let p = -1;
    let raf = 0;
    let visible = true;

    // Writes each line's intensity for a given playhead position.
    const apply = (v: number) => {
      // Each line peaks when the playhead reaches its slot's centre and fades
      // out over one slot's width either side.
      const slot = 1 / n;
      els.forEach((el, i) => {
        const centre = (i + 0.5) * slot;
        const d = Math.abs(v - centre) / slot;
        const lit = Math.max(0, 1 - d);
        el.style.setProperty("--lit", (lit * lit * (3 - 2 * lit)).toFixed(3));
      });
    };
    const paint = () => {
      raf = 0;
      const next = p < 0 ? target : p + (target - p) * EASE;
      p = Math.abs(target - next) < 0.0004 ? target : next;
      apply(p);
      if (p !== target && visible) raf = requestAnimationFrame(paint);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onScroll = () => {
      const rect = runway.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      target = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
      // Animation frames are paused while the page is hidden; keep the state
      // correct so it is already right when the tab comes back.
      if (document.hidden) {
        p = target;
        apply(p);
      } else {
        start();
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(runway);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={runwayRef} className={runwayClassName}>
      <div className={pinClassName}>
        <p ref={wrapRef} className={textWrapClassName}>
          {lines.map((line, i) => (
            <span
              key={i}
              className={lineClassName}
              style={{ "--lit": i === initial ? 1 : 0 } as CSSProperties}
            >
              <span className={textClassName}>{line.text}</span>
              <span className={accentClassName}>{line.accent}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
