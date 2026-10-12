"use client";

import { useEffect, useRef, useState } from "react";
import s from "./MultiDevice.module.css";

type Caption = { title: string; text: string };

type Props = {
  captions: Caption[];
  /** Frame at which each caption after the first takes over (mid-spin). */
  switchAt: number[];
  /** Before this frame no caption shows: the phones are still centred. */
  firstAt: number;
};

/**
 * The feature copy beside the phones. Which caption is up is decided by the
 * frame on show (ScrollFrames' "framechange" event), but the change itself is
 * a timed transition, not scrubbed with the scroll: the outgoing copy lifts
 * away and the next rises in, counter, title and text a beat apart. So the
 * copy is never left part-faded when the scroll stops mid-change. Scrolling
 * back runs the movement the other way.
 */
// The shortest time a caption stays up, however fast the scroll: long enough
// to take in the title and the line under it.
const MIN_SHOW = 1100;

export default function FeatureCaptions({ captions, switchAt, firstAt }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    const pin = ref.current?.parentElement;
    if (!pin) return;
    // What the frame says should be up, and what is up. They differ only when
    // the scroll runs ahead: then the shown caption steps one at a time toward
    // the target, each held MIN_SHOW ms, so a fast scroll cannot skip any.
    let target = -1;
    let shown = -1;
    let shownAt = 0;
    let timer = 0;
    const step = () => {
      timer = 0;
      if (shown === target) return;
      const wait = shown < 0 ? 0 : MIN_SHOW - (performance.now() - shownAt);
      if (wait > 0) {
        timer = window.setTimeout(step, wait);
        return;
      }
      const next = shown + Math.sign(target - shown);
      setDir(next > shown ? 1 : -1);
      shown = next;
      shownAt = performance.now();
      setActive(next);
      if (shown !== target) timer = window.setTimeout(step, MIN_SHOW);
    };
    const onFrame = (e: Event) => {
      const f = (e as CustomEvent<number>).detail;
      let next = f < firstAt ? -1 : 0;
      if (next === 0) for (const at of switchAt) if (f >= at) next++;
      if (next === target) return;
      target = next;
      // Leaving the section (back before the first): drop straight out.
      if (target < 0) {
        window.clearTimeout(timer);
        timer = 0;
        shown = -1;
        setActive(-1);
        return;
      }
      if (!timer) step();
    };
    pin.addEventListener("framechange", onFrame);
    return () => {
      pin.removeEventListener("framechange", onFrame);
      window.clearTimeout(timer);
    };
  }, [firstAt, switchAt]);

  return (
    <div ref={ref} className={s.captions} data-dir={dir}>
      {captions.map((c, i) => {
        const state = i === active ? "in" : i < active ? "before" : "after";
        return (
          <div key={c.title} className={s.caption} data-state={state} aria-hidden={state !== "in"}>
            <p className={`${s.count} ${s.piece}`} aria-hidden="true">
              <span className={s.countNow}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.countRule} />
              {String(captions.length).padStart(2, "0")}
            </p>
            <h3 className={`${s.title} ${s.piece}`}>{c.title}</h3>
            <p className={`${s.text} ${s.piece}`}>{c.text}</p>
          </div>
        );
      })}
    </div>
  );
}
