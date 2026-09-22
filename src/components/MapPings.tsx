"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Props = {
  /** Dot centres as % of the map's width/height. */
  points: [number, number][];
  className: string;
  activeClassName: string;
};

const MIN_GAP = 250; // ms between new pings
const MAX_GAP = 900;

/**
 * Fires a one-shot "ping" on a random city dot every so often, so activity
 * appears in random places and fades out again. Pauses while the map is
 * off-screen; does nothing under prefers-reduced-motion.
 */
export default function MapPings({ points, className, activeClassName }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.children) as HTMLElement[];

    let timer = 0;
    let visible = false;

    const fire = () => {
      const idle = els.filter((el) => !el.classList.contains(activeClassName));
      const el = idle[Math.floor(Math.random() * idle.length)];
      if (el) {
        el.classList.add(activeClassName);
        el.addEventListener("animationend", () => el.classList.remove(activeClassName), { once: true });
      }
      schedule();
    };
    const schedule = () => {
      if (!visible) return;
      timer = window.setTimeout(fire, MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP));
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      window.clearTimeout(timer);
      if (visible) schedule();
    });
    io.observe(root);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [activeClassName]);

  return (
    <div ref={ref} aria-hidden="true">
      {points.map(([x, y], i) => (
        <span key={i} className={className} style={{ left: `${x}%`, top: `${y}%` } as CSSProperties} />
      ))}
    </div>
  );
}
