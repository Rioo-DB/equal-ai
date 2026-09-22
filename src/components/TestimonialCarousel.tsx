"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import s from "./Testimonials.module.css";

type Card = { src: string; alt: string };

type Props = {
  cards: Card[];
  initial: number;
  width: number;
  height: number;
};

const MAX_TILT = 22; // degrees, reached one card-width away from centre

/**
 * Horizontally scrollable, snap-to-card carousel. The card nearest the centre of
 * the track is fully lit and face-on; the others dim and tilt away in 3D, with the
 * amount driven by their distance from centre (exposed as `--lit` / `--tilt`).
 * Supports trackpad/wheel, touch, keyboard (when focused) and mouse drag.
 */
export default function TestimonialCarousel({ cards, initial, width, height }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];

    let raf = 0;
    const update = () => {
      raf = 0;
      const t = track.getBoundingClientRect();
      const centre = t.left + t.width / 2;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const d = (r.left + r.width / 2 - centre) / r.width; // -1..1 = one card away
        const lit = Math.max(0, 1 - Math.abs(d));
        el.style.setProperty("--lit", lit.toFixed(3));
        el.style.setProperty("--tilt", (Math.max(-1, Math.min(1, d)) * -MAX_TILT).toFixed(2));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Open on the initial card without animating there.
    const target = items[initial];
    if (target) {
      const prev = track.style.scrollBehavior;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = target.offsetLeft + target.offsetWidth / 2 - track.clientWidth / 2;
      track.style.scrollBehavior = prev;
    }
    update();

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [initial]);

  // Mouse drag-to-scroll (touch already scrolls natively).
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
    trackRef.current.classList.add(s.dragging);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || !track) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    track.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    drag.current = null;
    trackRef.current?.classList.remove(s.dragging);
  };

  return (
    <div
      ref={trackRef}
      className={s.track}
      tabIndex={0}
      aria-label="Customer reviews, scroll horizontally"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      {cards.map((card, i) => {
        const d = i - initial;
        const style = {
          "--lit": d === 0 ? 1 : 0,
          "--tilt": Math.max(-1, Math.min(1, d)) * -MAX_TILT,
        } as CSSProperties;
        return (
          <figure key={card.src} className={s.card} style={style}>
            <Image
              src={card.src}
              alt={card.alt}
              width={width}
              height={height}
              sizes="(max-width: 1023px) 80vw, 420px"
              quality={90}
              draggable={false}
              className={s.cardImage}
            />
          </figure>
        );
      })}
    </div>
  );
}
