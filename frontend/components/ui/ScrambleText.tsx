"use client";

import { useEffect, useRef } from "react";
import { useSeen } from "./Reveal";

const GLYPHS = "01<>/{}[]=+*#$%&XLAB";

/**
 * Decodes from random glyphs to the real text when scrolled into view. Real text is SSR'd.
 * The scramble is written straight to an overlay node, not through React state: no re-render per
 * frame (these sit in session rows that may be opening at the same moment).
 */
export function ScrambleText({ text, className, duration = 1100 }: { text: string; className?: string; duration?: number }) {
  const [ref, seen] = useSeen<HTMLSpanElement>();
  const base = useRef<HTMLSpanElement>(null);
  const over = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const b = base.current;
    const o = over.current;
    if (!seen || !b || !o || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const startAt = performance.now();
    let raf = 0;
    const finish = () => {
      o.textContent = "";
      b.style.visibility = "";
    };
    const tick = (now: number) => {
      const p = Math.min(1, (now - startAt) / duration);
      const fixed = Math.floor(p * text.length);
      o.textContent = text
        .split("")
        .map((ch, i) => (i < fixed || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
      if (p < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    b.style.visibility = "hidden";
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      finish();
    };
  }, [seen, text, duration]);

  // The real text holds the box at its final size (hidden while the scramble draws on top of it).
  // Random glyphs are wider or narrower than the real ones, so without this the box resizes
  // every frame and everything below it jumps up and down.
  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden className="relative inline-block whitespace-nowrap">
        <span ref={base}>{text}</span>
        {/* clip sideways only: overflow-hidden also cut descenders (the "g" in "Aug") under a tight line-height */}
        <span ref={over} className="absolute inset-0 overflow-x-clip" />
      </span>
    </span>
  );
}
