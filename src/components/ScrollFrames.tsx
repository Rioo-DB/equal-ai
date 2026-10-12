"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** Folder of zero-padded WebP frames (001.webp …), see scripts/extract-frames.mjs. */
  dir: string;
  count: number;
  /** Fingerprint of the sequence, appended to each frame URL to defeat caches. */
  version: string;
  /**
   * Frames i whose next frame is far from them (the video's whip-spins). The
   * playhead switches across these outright: blending two far-apart frames
   * shows both at once, as see-through copies.
   */
  cuts?: number[];
  /** Frame size from the manifest; the sequence is not square. */
  width: number;
  height: number;
  ariaLabel: string;
  /**
   * A sharper close-up of part of the first frame: file name within `dir`, and
   * where it sits across the frame (fractions of its width). Shown over the
   * canvas while the first frame holds, which is when the stage is magnified.
   */
  poster?: { src: string; left: number; width: number };
  /** The tall scroll runway; its height minus one viewport is one full play. */
  className?: string;
  /** The sticky, viewport-high stage the canvas sits in. */
  pinClassName?: string;
  /** Sizes and moves the frame; the canvas and poster fill it. */
  canvasClassName?: string;
  /**
   * A tiny copy of each frame drawn behind the stage, which CSS can stretch
   * and blur into a glow: on a portrait phone a 16:9 frame is a band across
   * the middle, and this fills the dark above and below it with its colours.
   */
  ambientClassName?: string;
  /**
   * Rendered on the stage after the canvas; reads the playhead as `--p` and
   * the frame shown as `--f`.
   */
  caption?: ReactNode;
  /**
   * The stretch of the playhead (0..1) the frames play over. Before `playFrom`
   * the first frame holds, after `playTo` the last, so the stage can run its
   * own moves (a pull-back, a fade) on a still image.
   */
  playFrom?: number;
  playTo?: number;
};

// How much of the remaining gap to the scroll position the playhead closes per
// 60Hz frame. High, so the scroll dictates the frame shown and the sequence
// stops when the wheel stops; only the jump of a single wheel notch is
// softened, over a few frames. Scaled by elapsed time so 120Hz screens and
// dropped frames track the same way.
const EASE = 0.3;

// The ambient copy: small enough that drawing it each frame costs nothing.
const AMBIENT_W = 32;
const AMBIENT_H = 18;

// The video's whip-spins between screens only look right played at speed: a
// slow scroll through one shows each far-apart frame for a long time, which
// reads as lag. So the frames around each cut are a "spin" that plays on a
// clock instead of being scrubbed. Entering one carries the playhead through to
// its far end at RATE (frames per 60Hz tick: the sequence is 60fps, so 1 is the
// video's own speed) whether or not the scroll keeps moving, and backwards when
// scrolling up. Only when the scroll is already past the spin's far end may it
// go faster, up to MAX_RATE, so a long flick is not held back.
const RATE = 1.2;
const MAX_RATE = 3;
// Share of scroll a spin frame gets relative to a screen frame. Spins play on
// their own, so they need little scroll; the rest goes to the screens.
const SPIN_SCROLL = 0.15;
// Cuts closer than this belong to the same spin.
const SPIN_GAP = 4;

/*
 * Memory and decoding. Frames are fetched as compressed blobs (~25KB each) and
 * only turned into pixels — ImageBitmaps, decoded off the main thread — for a
 * window around the playhead. Nothing is ever drawn from an <img>: that decodes
 * on the main thread mid-scroll (the stutter) and the browser keeps a full-size
 * decoded copy of each one it has drawn, which across hundreds of frames runs
 * to gigabytes and crashed the tab.
 */
// Frames either side of the playhead kept decoded.
const WINDOW = 18;
// Decodes in flight at once. A fast scroll asks for many frames; queueing them
// nearest-first instead of starting them all keeps the CPU free to draw.
const DECODERS = 3;
// Downloads in flight at once.
const FETCHERS = 6;

const fill = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;

const frameSrc = (dir: string, i: number, v: string) =>
  `${dir}/${String(i + 1).padStart(3, "0")}.webp?v=${v}`;

/**
 * A scroll-scrubbed image sequence: the stage stays pinned while the runway's
 * extra height scrolls past, and the frame shown follows scroll progress.
 * The playhead eases toward the scroll position and lands between frames, so
 * each draw blends the two neighbours — motion stays continuous rather than
 * stepping a frame at a time. The stage also carries the playhead as `--p`
 * (0..1) so captions can be cued off the sequence. Under prefers-reduced-motion
 * only the first frame is shown.
 */
export default function ScrollFrames({
  dir,
  count,
  version,
  width,
  height,
  ariaLabel,
  poster,
  cuts,
  className,
  pinClassName,
  canvasClassName,
  ambientClassName,
  caption,
  playFrom = 0,
  playTo = 1,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const ambientRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    // Opaque: the frames are fully black-backed, so the page need not blend
    // the canvas with what is behind it.
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!wrap || !pin || !canvas || !ctx) return;
    const ambient = ambientRef.current;
    // Only when it is shown (CSS hides it outside portrait phones).
    const actx = ambient && getComputedStyle(ambient).display !== "none" ? ambient.getContext("2d", { alpha: false }) : null;

    // Decode no larger than the canvas is shown at: on a phone the frame is a
    // third of the width, and so is the memory each bitmap takes.
    // offsetWidth, not the bounding box: the stage opens scaled up 3x.
    const shown = Math.ceil(canvas.offsetWidth * (window.devicePixelRatio || 1));
    const decodeWidth = Math.min(width, Math.max(shown, 480));
    const decodeHeight = Math.round((decodeWidth * height) / width);


    // Spins: runs of nearby cuts, as [start, end] frame ranges.
    const spins: [number, number][] = [];
    for (const c of [...(cuts ?? [])].sort((x, y) => x - y)) {
      const lastSpin = spins[spins.length - 1];
      if (lastSpin && c - lastSpin[1] <= SPIN_GAP) lastSpin[1] = c + 1;
      else spins.push([c, c + 1]);
    }
    const spinAt = (f: number) => spins.find(([a, b]) => f > a && f < b);
    const inSpin = (f: number) => spins.some(([a, b]) => f >= a && f < b);

    // Scroll is shared out by weight: each step from frame i to i+1 weighs 1,
    // or SPIN_SCROLL inside a spin. cum[i] is the weight up to frame i.
    const cum = new Float64Array(count);
    for (let i = 1; i < count; i++) cum[i] = cum[i - 1] + (inSpin(i - 1) ? SPIN_SCROLL : 1);
    const total = cum[count - 1] || 1;
    const blobs: (Blob | undefined)[] = new Array(count);
    const bitmaps = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    const controller = new AbortController();
    let drawn = -1;
    // Playhead (0..1, eased toward the scroll) — drives the CSS moves.
    let current = 0;
    let target = 0;
    // Frame shown, fractional, and the frame it is heading for.
    let pos = 0;
    let goal = 0;
    let lastWhole = -1;
    // Direction the scroll last moved in, and the frame it pointed at then.
    let scrollDir = 1;
    let lastAim = 0;
    let raf = 0;
    let last = 0;
    let disposed = false;

    // Fractional frame position for a playhead value, through the weights.
    const frameAt = (p: number) => {
      const u = Math.min(Math.max((p - playFrom) / (playTo - playFrom), 0), 1) * total;
      let lo = 0;
      let hi = count - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= u) lo = mid;
        else hi = mid;
      }
      const w = cum[hi] - cum[lo];
      return w > 0 ? lo + (u - cum[lo]) / w : lo;
    };

    // Where the frames should head for a scroll position: never part-way into
    // a spin — to its far end in the direction the scroll is moving. Taken from
    // the scroll, not from the shown frame: the frame overtakes a scroll that
    // stopped mid-spin, and judging by it would flip the spin into reverse.
    const goalFor = (f: number) => {
      if (Math.abs(f - lastAim) > 0.01) {
        scrollDir = Math.sign(f - lastAim);
        lastAim = f;
      }
      const spin = spinAt(f);
      if (!spin) return f;
      return scrollDir > 0 ? spin[1] : spin[0];
    };

    // Move the shown frame toward the goal for a tick of dt ms.
    const advance = (dt: number) => {
      const gap = goal - pos;
      if (Math.abs(gap) < 0.001) {
        pos = goal;
        return;
      }
      const ticks = dt / 16.7;
      let step = gap * (1 - Math.pow(1 - EASE, ticks));
      const dir = Math.sign(gap);
      // Inside a spin (or about to be): play at the video's pace.
      const at = dir > 0 ? pos : pos - 0.001;
      const spin = spins.find(([a, b]) => at >= a && at < b);
      if (spin) {
        // At the video's pace, unless the goal lies beyond this spin.
        const beyond = dir > 0 ? goal > spin[1] : goal < spin[0];
        const max = beyond ? MAX_RATE : RATE;
        step = dir * Math.min(Math.max(Math.abs(step), RATE * ticks), max * ticks);
      } else {
        // Stop at a spin's edge so it is entered at the video's pace.
        const edge = spins.find(([a, b]) => (dir > 0 ? a > pos && a < pos + step : b < pos && b > pos + step));
        if (edge) step = (dir > 0 ? edge[0] : edge[1]) - pos;
      }
      pos = Math.abs(step) >= Math.abs(gap) ? goal : pos + step;
    };

    // The decoded frame closest to i, looking outward through the window.
    const nearestDecoded = (i: number) => {
      for (let d = 0; d <= WINDOW; d++) {
        if (bitmaps.has(i - d)) return i - d;
        if (bitmaps.has(i + d)) return i + d;
      }
      return -1;
    };

    // One frame per draw, the nearest one to the playhead. The sequence is
    // 60fps, so a step is small; blending neighbours as well meant uploading
    // two full-size bitmaps to the GPU on almost every animation frame while
    // scrolling, which is what made it lag. Now nothing is redrawn until the
    // playhead reaches another frame.
    const draw = (pos: number) => {
      const want = Math.round(pos);
      const n = bitmaps.has(want) ? want : nearestDecoded(want);
      // Not decoded yet (a fast scroll outran the decoders): hold the nearest
      // frame that is, rather than decode on the main thread.
      if (n < 0 || n === drawn) return;
      const bm = bitmaps.get(n);
      if (!bm) return;
      ctx.drawImage(bm, 0, 0, width, height);
      actx?.drawImage(bm, 0, 0, AMBIENT_W, AMBIENT_H);
      drawn = n;
    };

    // Free bitmaps that have left the window, then start decoding the missing
    // frames nearest the playhead, a few at a time.
    const schedule = () => {
      if (disposed) return;
      const at = Math.round(pos);
      for (const [i, bm] of bitmaps) {
        if (Math.abs(i - at) > WINDOW + 2 && i !== 0) {
          bm.close();
          bitmaps.delete(i);
        }
      }
      for (let d = 0; d <= WINDOW && decoding.size < DECODERS; d++) {
        for (const i of d ? [at + d, at - d] : [at]) {
          if (decoding.size >= DECODERS) break;
          if (i < 0 || i >= count || bitmaps.has(i) || decoding.has(i)) continue;
          const blob = blobs[i];
          if (!blob) continue;
          decoding.add(i);
          createImageBitmap(blob, { resizeWidth: decodeWidth, resizeHeight: decodeHeight, resizeQuality: "high" })
            .then((bm) => {
              decoding.delete(i);
              const now = Math.round(pos);
              if (disposed || (Math.abs(i - now) > WINDOW + 2 && i !== 0)) {
                bm.close();
              } else {
                bitmaps.set(i, bm);
                // It may be the frame the stage is waiting on.
                if (Math.abs(i - pos) < 1.5) {
                  drawn = -1;
                  draw(pos);
                }
              }
              schedule();
            })
            .catch(() => {
              decoding.delete(i);
            });
        }
      }
    };

    const show = () => {
      pin.style.setProperty("--p", current.toFixed(4));
      pin.style.setProperty("--f", pos.toFixed(2));
      // Whole-frame changes, for anything on the stage that switches on the
      // frame rather than scrubbing with it (the feature captions).
      const whole = Math.round(pos);
      if (whole !== lastWhole) {
        lastWhole = whole;
        pin.dispatchEvent(new CustomEvent("framechange", { detail: whole }));
      }
      draw(pos);
      schedule();
      // The poster is the first frame at full resolution; it stands in for the
      // canvas while the first frame holds and the stage is magnified.
      // Only once it has really loaded: a missing or half-loaded image would
      // show as the browser's broken-image box over the stage.
      const img = posterRef.current;
      if (img) img.style.opacity = pos === 0 && img.complete && img.naturalWidth > 0 ? "1" : "0";
    };
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(now - last, 100) : 16.7;
      last = now;
      current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.7));
      if (Math.abs(target - current) < 0.00005) current = target;
      goal = goalFor(frameAt(target));
      advance(dt);
      show();
      if (current !== target || pos !== goal) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      target = runway > 0 ? Math.min(Math.max(-rect.top / runway, 0), 1) : 0;
      // Frames are paused while the page is hidden, so easing would stall and
      // leave the stage part-way; jump straight to the answer instead.
      if (document.hidden) {
        current = target;
        pos = goal = goalFor(frameAt(target));
        show();
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const fetchFrame = (i: number) =>
      fetch(frameSrc(dir, i, version), { signal: controller.signal })
        .then((r) => (r.ok ? r.blob() : undefined))
        .then((blob) => {
          if (disposed || !blob) return;
          blobs[i] = blob;
          // Decode it now if it falls inside the window.
          if (Math.abs(i - pos) <= WINDOW) schedule();
        })
        .catch(() => undefined);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fetchFrame(0);
    if (reduced) {
      // Nothing will drive --p, so pin the first caption alongside frame one.
      pin.style.setProperty("--p", "0");
      return () => {
        disposed = true;
        controller.abort();
        for (const bm of bitmaps.values()) bm.close();
      };
    }

    // Fetch the rest coarse to fine: every 16th frame first, then every 8th,
    // and so on. A fast scroll to anywhere in the sequence then finds a frame
    // close by long before the whole run has arrived.
    const order: number[] = [];
    const queued = new Set([0]);
    for (const step of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += step) {
        if (!queued.has(i)) {
          queued.add(i);
          order.push(i);
        }
      }
    }
    let next = 0;
    const fetcher = async () => {
      while (next < order.length && !disposed) await fetchFrame(order[next++]);
    };
    for (let k = 0; k < FETCHERS; k++) fetcher();

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      disposed = true;
      controller.abort();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
      for (const bm of bitmaps.values()) bm.close();
      bitmaps.clear();
    };
    // `cuts` is read once per sequence; `version` changes whenever it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, count, version, width, height, playFrom, playTo]);

  return (
    <div ref={wrapRef} className={className}>
      <div ref={pinRef} className={pinClassName}>
        {ambientClassName && (
          <canvas ref={ambientRef} width={AMBIENT_W} height={AMBIENT_H} className={ambientClassName} aria-hidden="true" />
        )}
        <div className={canvasClassName} role="img" aria-label={ariaLabel}>
          <canvas ref={canvasRef} width={width} height={height} style={fill} />
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element -- a still swapped by script, sized by its frame
            <img
              ref={posterRef}
              src={`${dir}/${poster.src}?v=${version}`}
              alt=""
              decoding="async"
              onLoad={(e) => {
                // Reveal it if the stage is still holding the first frame.
                const p = parseFloat(pinRef.current?.style.getPropertyValue("--p") || "0");
                if (p <= playFrom) e.currentTarget.style.opacity = "1";
              }}
              style={{
                opacity: 0,
                position: "absolute",
                top: 0,
                left: `${poster.left * 100}%`,
                width: `${poster.width * 100}%`,
                height: "100%",
              }}
            />
          )}
        </div>
        {caption}
      </div>
    </div>
  );
}
