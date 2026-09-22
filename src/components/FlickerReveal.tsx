"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className: string;
  /** Number of glowing patches. */
  patches?: number;
  /** Patch radius as a fraction of the parent's width. */
  radius?: number;
};

type Patch = { x: number; y: number; dx: number; dy: number; f1: number; f2: number; p1: number; p2: number };

/**
 * Masks its children to a handful of soft patches that flicker in and out and
 * drift slowly on their own, so a background only ever shows through in
 * shifting pools of light. Runs on requestAnimationFrame; pauses while the
 * parent is off-screen and does nothing under prefers-reduced-motion (the CSS
 * decides what shows then).
 */
export default function FlickerReveal({ children, className, patches = 7, radius = 0.22 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const ps: Patch[] = Array.from({ length: patches }, () => ({
      x: rand(0.05, 0.95),
      y: rand(0.05, 0.95),
      dx: rand(-0.012, 0.012),
      dy: rand(-0.008, 0.008),
      // Two incommensurate frequencies per patch give an irregular, non-looping flicker.
      f1: rand(0.25, 0.55),
      f2: rand(0.9, 1.7),
      p1: rand(0, Math.PI * 2),
      p2: rand(0, Math.PI * 2),
    }));

    let raf = 0;
    let visible = true;
    let last = performance.now();

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = now / 1000;
      const r = parent.clientWidth * radius;
      const layers: string[] = [];
      for (const p of ps) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        if (p.x < 0 || p.x > 1) p.dx *= -1;
        if (p.y < 0 || p.y > 1) p.dy *= -1;
        // Slow swell × faster shimmer, squared so patches spend more time dark than lit.
        const swell = 0.5 + 0.5 * Math.sin(t * p.f1 * Math.PI * 2 + p.p1);
        const shimmer = 0.7 + 0.3 * Math.sin(t * p.f2 * Math.PI * 2 + p.p2);
        const a = Math.min(1, swell * swell * shimmer * 1.3);
        if (a < 0.02) continue;
        layers.push(
          `radial-gradient(circle ${r.toFixed(0)}px at ${(p.x * 100).toFixed(2)}% ${(p.y * 100).toFixed(2)}%, rgba(0,0,0,${a.toFixed(3)}) 0%, rgba(0,0,0,${(a * 0.5).toFixed(3)}) 45%, transparent 100%)`,
        );
      }
      const mask = layers.length ? layers.join(",") : "radial-gradient(circle 0px at 0 0, transparent, transparent)";
      el.style.maskImage = mask;
      el.style.webkitMaskImage = mask;
      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    // Only animate while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(parent);
    start();

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      raf = 0;
    };
  }, [patches, radius]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
