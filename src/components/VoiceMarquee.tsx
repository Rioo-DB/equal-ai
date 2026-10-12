"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import s from "./Testimonials.module.css";

type Card = { img: string; name: string; line: string; role: string };

type Props = {
  cards: Card[];
  card: { width: number; height: number };
};

// px per second the strip drifts on its own. Negative: the cards travel left
// to right (the view scrolls back through the track, wrapping seamlessly).
const SPEED = -42;
const RESUME_AFTER = 2400; // ms of stillness before the drift picks back up
const NUDGE_MS = 520; // how long an arrow press takes to glide one card over

// When the cards scale in — all together, as one row — as start and duration
// fractions of the section's scroll progress, after the heading has landed.
const REVEAL: [number, number] = [0.26, 0.3];

/**
 * A strip of testimonial cards drifting left to right that can also be moved
 * by hand — dragged, swiped, or stepped a card at a time with the arrows. The list is rendered twice and the scroll position wraps at
 * half the track's width, so the second copy stands in for the first and the
 * loop has no seam in either direction. The duplicate is hidden from assistive
 * tech. Drift, drag, swipe and the arrows all move one offset, applied as a
 * transform, so they act on the same thing and cannot fight.
 */
export default function VoiceMarquee({ cards, card }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  // Set by the effect: glides the strip one card left (-1) or right (1).
  const nudgeRef = useRef<(dir: -1 | 1) => void>(() => undefined);

  useEffect(() => {
    const view = viewRef.current;
    const track = view?.firstElementChild as HTMLElement | null;
    if (!view || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let idleAt = 0;
    let dragging = false;
    let nudge: { from: number; by: number; start: number } | null = null;
    // How far the track is shifted left, in px. Applied as a transform rather
    // than scrollLeft: scroll positions snap to whole pixels, so a slow drift
    // moved in uneven 0- and 1-px steps and the cards visibly shook.
    let offset = 0;

    // The strip only runs once the reveal has finished; until then it stays put
    // so the cards the entrance builds stay where they were placed. HeroPin
    // writes the progress inline, so it is read without a style recalc.
    const stage = view.closest("[class*='pin']") as HTMLElement | null;
    const progress = () => {
      const raw = stage ? parseFloat(stage.style.getPropertyValue("--p")) : 1;
      return Number.isFinite(raw) ? raw : 0;
    };

    // The list is rendered twice; half the track is one copy. Measured once
    // and on resize, not per frame.
    let half = track.scrollWidth / 2;
    // Keep the shift inside one copy's width, so there is always another copy
    // of the strip either side of the viewport.
    const wrapped = (x: number) => (half > 0 ? ((x % half) + half) % half : x);
    const apply = () => {
      track.style.transform = `translate3d(${(-offset).toFixed(2)}px, 0, 0)`;
    };
    // Where the strip rests before it starts moving. On narrow screens, with
    // the first card centred (the loop puts the last card's end to its left),
    // rather than flush against the screen edge where the fade cuts into it.
    const restOffset = () => {
      if (window.innerWidth >= 1024) return 0;
      const card = track.querySelector("figure");
      const w = card ? card.getBoundingClientRect().width : 0;
      return wrapped(-(view.clientWidth - w) / 2);
    };
    offset = restOffset();
    apply();

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      if (progress() < REVEAL[0] + REVEAL[1] && !dragging && !nudge) {
        // Hold the opening position until the cards have landed.
        const rest = restOffset();
        if (offset !== rest) {
          offset = rest;
          apply();
        }
        return;
      }
      if (nudge) {
        const k = Math.min((t - nudge.start) / NUDGE_MS, 1);
        const ease = 1 - Math.pow(1 - k, 3);
        offset = wrapped(nudge.from + nudge.by * ease);
        if (k >= 1) nudge = null;
      } else if (!dragging && !reduced && t >= idleAt) {
        offset = wrapped(offset + SPEED * dt);
      } else {
        return;
      }
      apply();
    };
    const start = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Any hand-driven movement holds the drift off for a moment.
    const hold = () => {
      idleAt = performance.now() + RESUME_AFTER;
    };

    // One card's width plus the gap, read off the layout.
    const step = () => {
      const [a, b] = track.querySelectorAll("figure");
      return a && b ? b.getBoundingClientRect().left - a.getBoundingClientRect().left : view.clientWidth / 3;
    };
    nudgeRef.current = (dir) => {
      hold();
      // Chained presses carry on from where the last glide was heading.
      const from = nudge ? nudge.from + nudge.by : offset;
      nudge = { from, by: dir * step(), start: performance.now() };
      start();
    };

    let startX = 0;
    let startOffset = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      nudge = null;
      startX = e.clientX;
      startOffset = offset;
      view.setPointerCapture(e.pointerId);
      view.classList.add(s.grabbing);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      offset = wrapped(startOffset - (e.clientX - startX));
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      hold();
      if (view.hasPointerCapture(e.pointerId)) view.releasePointerCapture(e.pointerId);
      view.classList.remove(s.grabbing);
    };
    // Sideways trackpad swipes move the strip; vertical wheel scrolling is
    // left alone so the page still scrolls past.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      hold();
      nudge = null;
      offset = wrapped(offset + e.deltaX);
      apply();
    };
    const onResize = () => {
      half = track.scrollWidth / 2;
      offset = wrapped(offset);
      apply();
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(view);

    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);
    view.addEventListener("wheel", onWheel, { passive: false });
    view.addEventListener("mouseenter", hold);
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      stop();
      view.removeEventListener("pointerdown", onDown);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerup", onUp);
      view.removeEventListener("pointercancel", onUp);
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("mouseenter", hold);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const run = (copy: number) =>
    cards.map((c, i) => (
      <figure
        className={s.card}
        key={`${copy}-${i}`}
        aria-hidden={copy === 1 ? true : undefined}
        style={{ "--rs": REVEAL[0], "--rd": REVEAL[1] } as CSSProperties}
      >
        <div className={s.frame}>
          <Image
            src={c.img}
            alt={copy === 0 ? `${c.name}, ${c.role}` : ""}
            width={card.width}
            height={card.height}
            sizes="(max-width: 1023px) 78vw, 30vw"
            quality={82}
            className={s.photo}
            draggable={false}
          />
          {/* Decorative: these are stills, so the controls are not focusable. */}
          <div className={s.controls} aria-hidden="true">
            <span className={s.mute}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" />
                <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className={s.play}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>
        <figcaption className={s.caption}>
          <p className={s.line}>
            <span className={s.name}>{c.name}</span> {c.line}
          </p>
          <p className={s.role}>{c.role}</p>
        </figcaption>
      </figure>
    ));

  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      className={`${s.arrow} ${dir < 0 ? s.arrowPrev : s.arrowNext}`}
      aria-label={dir < 0 ? "Previous testimonials" : "Next testimonials"}
      onClick={() => nudgeRef.current(dir)}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <div className={s.strip}>
      <div ref={viewRef} className={s.marquee}>
        <div className={s.track}>
          {run(0)}
          {run(1)}
        </div>
      </div>
      {arrow(-1)}
      {arrow(1)}
    </div>
  );
}
