"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Spark = { x: number; y: number; size: number; delay: number; duration: number; peak: number };

type Props = {
  sparks: Spark[];
  className: string;
  sparkClassName: string;
};

const RADIUS = 0.26; // share of the stage's diagonal the cursor lights up
const FALLOFF = 2.2; // higher concentrates the effect nearer the pointer
// The field has faded out by this point of the hero's progress (--H in
// Hero.module.css runs 0.3 -> 0.75); past it the dots are taken out.
const GONE_AT = 0.78;

/**
 * The flickering dots, with the ones near the pointer lit up. Each dot already
 * runs its own flicker; this only raises how brightly that flicker reads, so
 * the field appears to catch light around the cursor rather than gaining a
 * second, competing animation.
 *
 * Proximity is written as `--near` (0..1) per dot, batched into one animation
 * frame per pointer move and skipped when the value has not meaningfully
 * changed, so a fast sweep does not mean 60 style writes per event.
 */
export default function SparkField({ sparks, className, sparkClassName }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  // The dots' flicker runs on the main thread (its keyframes read per-dot
  // custom properties, and each dot has a glow filter), so 60 of them cost a
  // repaint every frame for as long as they exist — which slowed the phones
  // section further down to ~20fps. Take them out of rendering whenever they
  // cannot be seen: once the hero has faded them out, or is off screen.
  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.parentElement;
    if (!root || !stage) return;

    let inView = true;
    const update = () => {
      const p = parseFloat(stage.style.getPropertyValue("--p")) || 0;
      root.toggleAttribute("data-off", !inView || p >= GONE_AT);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(stage);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.parentElement;
    if (!stage) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(root.children) as HTMLElement[];
    const last = new Array(els.length).fill(-1);
    let raf = 0;
    let px = -1;
    let py = -1;

    const apply = () => {
      raf = 0;
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const reach = Math.hypot(r.width, r.height) * RADIUS;

      els.forEach((el, i) => {
        let near = 0;
        if (px >= 0) {
          const dx = r.left + (sparks[i].x / 100) * r.width - px;
          const dy = r.top + (sparks[i].y / 100) * r.height - py;
          const d = Math.hypot(dx, dy);
          near = d >= reach ? 0 : Math.pow(1 - d / reach, FALLOFF);
        }
        const q = Math.round(near * 100) / 100;
        if (q !== last[i]) {
          last[i] = q;
          el.style.setProperty("--near", String(q));
        }
      });
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      queue();
    };
    const onLeave = () => {
      px = -1;
      py = -1;
      queue();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [sparks]);

  return (
    <div ref={rootRef} className={className} aria-hidden="true">
      {sparks.map((d, i) => (
        <span
          key={i}
          className={sparkClassName}
          style={
            {
              left: `${d.x}%`,
              top: `${d.y}%`,
              "--size": `${d.size}px`,
              "--delay": `${d.delay}s`,
              "--duration": `${d.duration}s`,
              "--peak": d.peak,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
