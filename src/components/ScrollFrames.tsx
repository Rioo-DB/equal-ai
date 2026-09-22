"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Folder of zero-padded WebP frames (001.webp …), see scripts/extract-frames.mjs. */
  dir: string;
  count: number;
  size: number;
  ariaLabel: string;
  /** The tall scroll runway; its height minus one viewport is one full play. */
  className?: string;
  /** The sticky, viewport-high stage the canvas sits in. */
  pinClassName?: string;
  canvasClassName?: string;
};

const EASE = 0.18; // how quickly the playhead catches up with the scroll target (0..1 per frame)

const frameSrc = (dir: string, i: number) => `${dir}/${String(i + 1).padStart(3, "0")}.webp`;

/**
 * A scroll-scrubbed image sequence: the stage stays pinned while the runway's
 * extra height scrolls past, and the frame shown follows scroll progress. Frames
 * are decoded up front and drawn to a canvas, and the playhead eases toward the
 * scroll position, so scrubbing stays smooth regardless of scroll-event cadence.
 * Under prefers-reduced-motion only the first frame is shown.
 */
export default function ScrollFrames({ dir, count, size, ariaLabel, className, pinClassName, canvasClassName }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const frames: (HTMLImageElement | undefined)[] = new Array(count);
    let drawn = -1;
    let current = 0;
    let target = 0;
    let raf = 0;
    let disposed = false;

    const draw = (i: number) => {
      const img = frames[i];
      if (!img || i === drawn) return;
      ctx.drawImage(img, 0, 0, size, size);
      drawn = i;
    };
    const nearestLoaded = (i: number) => {
      for (let j = i; j >= 0; j--) if (frames[j]) return j;
      return -1;
    };
    const tick = () => {
      raf = 0;
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.0005) current = target;
      const i = nearestLoaded(Math.round(current * (count - 1)));
      if (i >= 0) draw(i);
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      target = runway > 0 ? Math.min(Math.max(-rect.top / runway, 0), 1) : 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const load = (i: number) => {
      const img = new Image();
      img.src = frameSrc(dir, i);
      return img
        .decode()
        .then(() => {
          if (disposed) return;
          frames[i] = img;
          // Fill in a frame the playhead is already waiting on.
          if (Math.round(current * (count - 1)) === i) draw(i);
        })
        .catch(() => undefined);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    load(0).then(() => draw(0));
    if (reduced) return;

    // Decode the rest a few at a time so the first frame appears immediately.
    let next = 1;
    const worker = async () => {
      while (next < count && !disposed) await load(next++);
    };
    for (let k = 0; k < 4; k++) worker();

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      disposed = true;
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, [dir, count, size]);

  return (
    <div ref={wrapRef} className={className}>
      <div className={pinClassName}>
        <canvas ref={canvasRef} width={size} height={size} className={canvasClassName} role="img" aria-label={ariaLabel} />
      </div>
    </div>
  );
}
