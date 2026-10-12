"use client";

import { useEffect, useRef, useState } from "react";
import s from "./DemoVideo.module.css";

type Box = { x: number; y: number; w: number; h: number };

type Props = {
  /** Scroll progress of the demo section at which the watch screen is up. */
  gateAt: number;
  /** That frame, and the frame count. */
  gate: number;
  count: number;
  /** The stretch of the section's progress the frames run over. */
  playFrom: number;
  playTo: number;
  /** The phone in the video frame, as fractions of it: the tap target. */
  watch: Box;
  /** The rest of the demo as a video with sound, starting at the gate frame. */
  video: string;
  prompt: { watch: string; skip: string; mute: string; unmute: string };
  /** Same box as the video frame, so the overlay lines up with the picture. */
  frameClassName: string;
};

/**
 *   before    scrolling towards the watch screen
 *   waiting   held there until the phone is tapped (or the demo skipped)
 *   playing   the rest of the demo as a video with sound; the page holds still
 *   done      the video has ended and stays on its last frame; scrolling on
 *   free      plain scrolling, never held again on this visit
 */
type State = "before" | "waiting" | "playing" | "done" | "free";

// Frames before the gate from which a tap on the phone plays the demo: from
// the moment the phone is fully in frame (its screen brightening to "Click
// here to watch", which comes up ~frame gate-14), so a tap never misses.
const WATCH_LEAD = 26;

const FORWARD_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
const SCROLL_KEYS = new Set([...FORWARD_KEYS, "ArrowUp", "PageUp", "Home"]);

/**
 * Holds the scroll at "Click here to watch Equal AI in action" until the
 * visitor taps the phone. The tap starts the rest of the demo as a real video
 * with sound — not scroll-driven — laid exactly over the frame it starts
 * from, with the page held still while it plays. The chat it shows is never
 * scroll-driven: the scrolled frames end at the watch screen. When the video
 * ends it holds its last frame and scrolling carries on to the next section.
 * Going back up is always allowed before playback.
 */
export default function DemoGate(props: Props) {
  const { gateAt, gate, watch, video, prompt, frameClassName } = props;
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>("before");
  const [muted, setMuted] = useState(false);
  const stateRef = useRef<State>("before");
  const set = (next: State) => {
    stateRef.current = next;
    setState(next);
  };

  // Scroll position for a point of the section's progress.
  const yAt = (p: number) => {
    const runway = ref.current?.parentElement?.parentElement;
    if (!runway) return Infinity;
    const top = runway.getBoundingClientRect().top + window.scrollY;
    return top + p * (runway.offsetHeight - window.innerHeight);
  };

  // Past the demo entirely, to the next section with its copy coming up.
  const skip = () => {
    videoRef.current?.pause();
    set("free");
    const next = ref.current?.closest("section")?.nextElementSibling as HTMLElement | null;
    if (next) {
      const top = next.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + window.innerHeight * 0.4, behavior: "instant" });
    }
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let touchY = 0;
    let holdY = 0;

    const onScroll = () => {
      const st = stateRef.current;
      if (st === "playing") {
        // The page holds still under the video.
        if (Math.abs(window.scrollY - holdY) > 1) window.scrollTo({ top: holdY, behavior: "instant" });
        return;
      }
      const y = yAt(gateAt);
      if (st === "done") {
        // Back up into the scrolled part: the video's last frame gives way to
        // the sequence again.
        if (window.scrollY < y - 40) set("free");
        return;
      }
      if (st === "free") return;
      if (st === "before" && window.scrollY >= y) {
        window.scrollTo({ top: y, behavior: "instant" });
        holdY = y;
        set("waiting");
        // Start fetching the video now, so the tap plays at once.
        const v = videoRef.current;
        if (v && v.preload !== "auto") {
          v.preload = "auto";
          v.load();
        }
      } else if (st === "waiting") {
        if (window.scrollY > y + 1) window.scrollTo({ top: y, behavior: "instant" });
        else if (window.scrollY < y - 40) set("before");
      }
    };
    const blocks = (forward: boolean) => {
      const st = stateRef.current;
      return st === "playing" || (st === "waiting" && forward);
    };
    const onWheel = (e: WheelEvent) => {
      if (blocks(e.deltaY > 0)) e.preventDefault();
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      // Finger moving up = scrolling down the page.
      if (blocks((e.touches[0]?.clientY ?? 0) < touchY)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement) return;
      if (SCROLL_KEYS.has(e.key) && blocks(FORWARD_KEYS.has(e.key))) e.preventDefault();
    };
    const v = videoRef.current;
    // Hold the video on its last frame and let the page scroll on.
    const onEnded = () => set("done");
    const onPlaying = () => {
      holdY = window.scrollY;
    };
    v?.addEventListener("ended", onEnded);
    v?.addEventListener("playing", onPlaying);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      v?.removeEventListener("ended", onEnded);
      v?.removeEventListener("playing", onPlaying);
      v?.pause();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
    // The layout is read fresh each time; nothing to resubscribe on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The watch screen is up for the last ~half second of the scrolled frames,
  // and a tap anywhere in that stretch — or on the video's end frame, to watch
  // again — plays it. Shown-frame check reads ScrollFrames' --f.
  const watchVisible = () => {
    const pin = ref.current?.parentElement;
    const f = parseFloat(pin?.style.getPropertyValue("--f") || "0");
    return f >= gate - WATCH_LEAD;
  };
  const play = () => {
    const v = videoRef.current;
    if (!v || stateRef.current === "playing") return;
    if (stateRef.current !== "done" && !watchVisible()) return;
    // Settle on the watch frame first, so the video starts from it.
    const y = yAt(gateAt);
    if (Number.isFinite(y)) window.scrollTo({ top: y, behavior: "instant" });
    if (v.preload !== "auto") v.preload = "auto";
    set("playing");
    v.currentTime = 0;
    v.muted = muted;
    v.volume = 1;
    // The tap allows sound; if the browser still refuses it, play silently
    // rather than stall, and show "Sound on" so it can be turned on.
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(skip);
    });
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };

  return (
    <div ref={ref} className={s.gate} data-state={state}>
      <div className={frameClassName}>
        {/* Starts on exactly the frame the sequence is held on, so the cut
            from scrubbed frames to playing video does not show. */}
        <video ref={videoRef} className={s.video} src={video} playsInline preload="metadata" />
        <button
          type="button"
          className={s.watch}
          style={{
            left: `${watch.x * 100}%`,
            top: `${watch.y * 100}%`,
            width: `${watch.w * 100}%`,
            height: `${watch.h * 100}%`,
          }}
          onClick={play}
          tabIndex={state === "playing" ? -1 : 0}
          aria-label="Watch Equal AI in action, with sound"
        />
      </div>

      <div className={s.bar}>
        {state === "waiting" && <span className={s.barText}>{prompt.watch}</span>}
        {state === "playing" && (
          <button type="button" className={s.barButton} onClick={toggleMute} aria-pressed={muted}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" />
              {muted ? (
                <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
            {muted ? prompt.unmute : prompt.mute}
          </button>
        )}
        {(state === "waiting" || state === "playing") && (
          <button type="button" className={s.barButton} onClick={skip}>
            {prompt.skip}
          </button>
        )}
      </div>
    </div>
  );
}
